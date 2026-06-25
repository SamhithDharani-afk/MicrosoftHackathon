// FeedbackFlow wireframe service.
//
// Encapsulates everything needed to turn a live URL into a before/after wireframe:
//   1. screenshotUrl()  — headless-browser PNG of the live page (Playwright).
//   2. runCopilot()     — one fully isolated Copilot CLI (Copilot Pro) call.
//   3. getOrCreateBefore() — screenshot -> vision reproduction of the page (the
//      expensive call), cached per website in SQLite so it is generated once.
//   4. applyFix()       — fast text-only call that applies ONLY the proposed fix
//      to the cached BEFORE html, producing the AFTER on the fly.
//
// The CLI is invoked in full isolation so these scripted calls never appear in the
// user's `copilot --resume` list, never sync to the Copilot web/mobile app, and
// never touch the real session-store.db.
//
// Both server/index.js (HTTP routes) and server/pregen.js (warm the cache) import
// from here, passing in the shared SQLite database instance.

import { spawn, execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  buildBeforePrompt,
  buildAfterPrompt,
  extractAnswer,
  cleanHtml,
  shouldCopyHomeEntry,
} from './wireframe-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

// Resolve a website's bundled screenshot asset (e.g. 'viva.png') to an absolute
// path under src/assets, or '' if not set / missing. When present this local
// image is used as the vision source instead of a live screenshot, which avoids
// login walls and is instant.
export function localScreenshotPath(screenshotAsset) {
  if (!screenshotAsset) return '';
  const p = path.join(ASSETS_DIR, screenshotAsset);
  return existsSync(p) ? p : '';
}

// gpt-5.4 reads a page screenshot well. Override with WIREFRAME_MODEL.
const MODEL = process.env.WIREFRAME_MODEL || 'gpt-5.4';
// Keep hidden reasoning low so generation stays fast (reasoning, not output size,
// dominates latency). Override with WIREFRAME_EFFORT (none|low|medium|high).
const EFFORT = process.env.WIREFRAME_EFFORT || 'low';
const GEN_TIMEOUT_MS = Number(process.env.WIREFRAME_TIMEOUT_MS) || 150000;
// Viewport used for both the screenshot and the reproduction target.
const VIEWPORT = { width: 1280, height: 900 };

const REAL_HOME = path.join(os.homedir(), '.copilot');
const EPHEMERAL_HOME = path.join(os.tmpdir(), 'feedbackflow-copilot-home');

// Resolve the copilot executable to a full path so we can spawn it with
// shell:false (which passes the prompt safely as a single argv entry — shell:true
// mangles quotes/semicolons/em-dashes and breaks exe resolution on Windows).
function resolveCopilot() {
  if (process.env.COPILOT_BIN) return process.env.COPILOT_BIN;
  try {
    const cmd = process.platform === 'win32' ? 'where copilot' : 'command -v copilot';
    const found = execSync(cmd, { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (found.length) return found[0];
  } catch {
    // fall through
  }
  return 'copilot';
}

const COPILOT_BIN = resolveCopilot();

// Seed the ephemeral home once with auth + config, but no session state.
function ensureEphemeralHome() {
  if (existsSync(path.join(EPHEMERAL_HOME, 'config.json'))) return;
  mkdirSync(EPHEMERAL_HOME, { recursive: true });
  for (const entry of readdirSync(REAL_HOME, { withFileTypes: true })) {
    if (!shouldCopyHomeEntry(entry.name)) continue;
    cpSync(path.join(REAL_HOME, entry.name), path.join(EPHEMERAL_HOME, entry.name), {
      recursive: true,
    });
  }
  mkdirSync(path.join(EPHEMERAL_HOME, 'session-state'), { recursive: true });
}

// Wipe the ephemeral session-state so nothing accumulates between calls.
function cleanEphemeralSessionState() {
  const ss = path.join(EPHEMERAL_HOME, 'session-state');
  try {
    rmSync(ss, { recursive: true, force: true });
    mkdirSync(ss, { recursive: true });
  } catch {
    // non-fatal
  }
}

let queue = Promise.resolve(); // serialize CLI calls within this process

// Screenshot the live page to a temp PNG. Returns the file path, or '' on any
// failure (bad URL, navigation timeout, launch error) so callers can react.
async function screenshotUrl(url) {
  if (!url) return '';
  let browser;
  try {
    const file = path.join(
      os.tmpdir(),
      `feedbackflow-shot-${Date.now()}-${Math.random().toString(36).slice(2)}.png`
    );
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: VIEWPORT });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await page.waitForTimeout(1200);
    await page.screenshot({ path: file });
    return file;
  } catch {
    return '';
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

function runCopilotRaw(prompt, attachment) {
  return new Promise((resolve, reject) => {
    ensureEphemeralHome();
    const args = [
      '-p',
      prompt,
      '--model',
      MODEL,
      ...(EFFORT && EFFORT !== 'default' ? ['--effort', EFFORT] : []),
      ...(attachment ? ['--attachment', attachment] : []),
      '--output-format',
      'json',
      '--allow-all-tools', // required for non-interactive mode
      '--available-tools=', // empty list => no tools available (pure completion)
      '--no-remote',
      '--no-remote-export',
      '--disable-builtin-mcps',
      '--no-color',
    ];
    const child = spawn(COPILOT_BIN, args, {
      env: { ...process.env, COPILOT_HOME: EPHEMERAL_HOME },
      cwd: EPHEMERAL_HOME, // sandbox the working dir away from the repo
    });
    let out = '';
    let err = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
    }, GEN_TIMEOUT_MS);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      cleanEphemeralSessionState();
      if (timedOut) {
        reject(new Error(`copilot timed out after ${GEN_TIMEOUT_MS}ms`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`copilot exited ${code}: ${err.slice(0, 800) || out.slice(0, 800)}`));
        return;
      }
      resolve(out);
    });
  });
}

// Serialize all CLI calls so concurrent requests never overlap (which could
// collide on the single ephemeral home).
function runCopilot(prompt, attachment) {
  const run = queue.then(() => runCopilotRaw(prompt, attachment));
  queue = run.catch(() => {});
  return run;
}

// ── SQLite cache ───────────────────────────────────────────────
export function ensureWireframeTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wireframes (
      website_id   TEXT PRIMARY KEY,
      url          TEXT,
      before_html  TEXT,
      created_at   TEXT NOT NULL
    );
  `);
  // Live-page screenshots are cached separately (as base64 data URLs) so showing
  // the real page in the "Before" toggle never re-screenshots on every view.
  db.exec(`
    CREATE TABLE IF NOT EXISTS wireframe_screenshots (
      website_id   TEXT PRIMARY KEY,
      url          TEXT,
      data_url     TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );
  `);
}

export function getCachedBefore(db, websiteId) {
  const row = db.prepare('SELECT before_html, url FROM wireframes WHERE website_id = ?').get(websiteId);
  return row && row.before_html ? { before: row.before_html, url: row.url || '' } : null;
}

export function getCachedScreenshot(db, websiteId) {
  const row = db
    .prepare('SELECT data_url, url FROM wireframe_screenshots WHERE website_id = ?')
    .get(websiteId);
  return row && row.data_url ? { dataUrl: row.data_url, url: row.url || '' } : null;
}

// Capture (or read) a PNG of the live page and return it as a base64 data URL,
// cached in SQLite per website so we screenshot at most once. A bundled local
// image (e.g. viva.png) is preferred over a live screenshot — it represents the
// real page without a login wall and is instant. Throws when neither source is
// available so the caller can surface a clear error.
export async function getOrCreateScreenshot(db, { websiteId, url, imagePath, refresh }) {
  if (!refresh) {
    const cached = getCachedScreenshot(db, websiteId);
    if (cached) return cached.dataUrl;
  }
  let shot = '';
  let isTemp = false;
  if (imagePath && existsSync(imagePath)) {
    shot = imagePath; // bundled asset — do not delete it afterwards
  } else if (url) {
    shot = await screenshotUrl(url);
    isTemp = !!shot;
  }
  if (!shot) {
    throw new Error(
      `Could not capture the live page for ${url || 'this website'} (no bundled image and the page may be unreachable or blocking us).`
    );
  }
  try {
    const dataUrl = `data:image/png;base64,${readFileSync(shot).toString('base64')}`;
    db.prepare(`
      INSERT INTO wireframe_screenshots (website_id, url, data_url, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(website_id) DO UPDATE SET url = excluded.url, data_url = excluded.data_url, created_at = excluded.created_at
    `).run(websiteId, url || '', dataUrl, new Date().toISOString());
    return dataUrl;
  } finally {
    if (isTemp) {
      try {
        unlinkSync(shot);
      } catch {
        // temp file cleanup is best-effort
      }
    }
  }
}

// Screenshot the live URL (or use a bundled local image) and reproduce it as
// faithful HTML (the expensive "before" call). A local imagePath, when provided,
// is preferred over a live screenshot (no login wall, instant). Throws if neither
// source is available or the model returns nothing, so callers can surface a
// clear error.
async function generateBefore({ url, imagePath }) {
  let shot = '';
  let isTemp = false;
  if (imagePath && existsSync(imagePath)) {
    shot = imagePath; // bundled asset — do not delete it afterwards
  } else if (url) {
    shot = await screenshotUrl(url);
    isTemp = !!shot;
  }
  if (!shot) {
    throw new Error(
      `Could not obtain a screenshot for ${url || 'this website'} (no bundled image and the page may be unreachable or blocking us).`
    );
  }
  try {
    const stdout = await runCopilot(buildBeforePrompt(), shot);
    const before = cleanHtml(extractAnswer(stdout));
    if (!before) throw new Error('Model returned no HTML for the page.');
    return before;
  } finally {
    if (isTemp) {
      try {
        unlinkSync(shot);
      } catch {
        // temp file cleanup is best-effort
      }
    }
  }
}

// Return the cached BEFORE for a website, generating + caching it on first use.
export async function getOrCreateBefore(db, { websiteId, url, imagePath }) {
  const cached = getCachedBefore(db, websiteId);
  if (cached) return cached.before;
  if (!url && !imagePath) throw new Error(`No URL or screenshot configured for website "${websiteId}".`);
  const before = await generateBefore({ url, imagePath });
  db.prepare(`
    INSERT INTO wireframes (website_id, url, before_html, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(website_id) DO UPDATE SET url = excluded.url, before_html = excluded.before_html, created_at = excluded.created_at
  `).run(websiteId, url || '', before, new Date().toISOString());
  return before;
}

// Deterministic fallback: if the model did not tag the change with data-ff-new,
// diff the AFTER against the BEFORE and tag the first opening tag on a line that is
// new/changed in the AFTER. Guarantees the UI always has a change anchor to point at.
// Structural / non-rendered tags are skipped: a marker on <html>/<head>/<meta>/etc.
// is invisible, which is what made the "NEW" arrow seem to disappear after a heavy
// refinement rewrite (where nearly every line differs and the first diff is the
// doctype/head).
const NON_VISIBLE_TAGS = new Set([
  'html', 'head', 'body', 'meta', 'link', 'style', 'title', 'script', 'base', 'noscript',
]);

function ensureChangeMarker(before, after) {
  if (/data-ff-new/i.test(after)) return after;
  const beforeLines = new Set(String(before).split(/\r?\n/).map((l) => l.trim()));
  const afterLines = String(after).split(/\r?\n/);
  for (let i = 0; i < afterLines.length; i += 1) {
    const trimmed = afterLines[i].trim();
    if (!trimmed || beforeLines.has(trimmed)) continue;
    // Only anchor the marker on a visible element — never on a structural tag whose
    // marker would render nothing (and so look like a missing arrow).
    const open = trimmed.match(/<([a-zA-Z][\w-]*)/);
    if (!open || NON_VISIBLE_TAGS.has(open[1].toLowerCase())) continue;
    // Tag the first opening tag on this changed line (skip closing tags / comments).
    const replaced = afterLines[i].replace(/<([a-zA-Z][\w-]*)((?:\s[^>]*?)?)(\/?)>/, (m, tag, attrs, selfClose) => {
      if (/data-ff-new/i.test(m) || NON_VISIBLE_TAGS.has(tag.toLowerCase())) return m;
      return `<${tag}${attrs} data-ff-new="true"${selfClose}>`;
    });
    if (replaced !== afterLines[i]) {
      afterLines[i] = replaced;
      return afterLines.join('\n');
    }
  }
  return after;
}

// Apply ONLY the proposed fix to the cached BEFORE html, on the fly, returning
// both documents so the UI can show a before/after pair. An optional `refinement`
// note (from the user, e.g. "put the gear top-right, not in a menu") is layered on
// top of the base fix so they can correct a wrong result without starting over.
export async function applyFix(db, { websiteId, url, imagePath, painPointSummary, fixTitle, fixDescription, refinement }) {
  const before = await getOrCreateBefore(db, { websiteId, url, imagePath });
  const stdout = await runCopilot(
    buildAfterPrompt({ beforeHtml: before, painPointSummary, fixTitle, fixDescription, refinement })
  );
  const after = cleanHtml(extractAnswer(stdout));
  if (!after) throw new Error('Model returned no HTML for the proposed change.');
  return { before, after: ensureChangeMarker(before, after) };
}

export { EPHEMERAL_HOME, MODEL };
