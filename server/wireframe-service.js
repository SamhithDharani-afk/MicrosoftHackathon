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
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';

const { GIFEncoder, quantize, applyPalette } = gifenc;
import {
  buildBeforePrompt,
  buildAfterPrompt,
  buildDevPromptRequest,
  buildWalkthroughStepsPrompt,
  parseStepsJson,
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
    if (found.length) {
      if (process.platform === 'win32') {
        // `where copilot` can list an extensionless shell script first (e.g. the
        // VS Code-bundled `copilot`), which CreateProcess cannot launch with
        // shell:false and fails with ENOENT. Prefer a real .exe.
        const byExt = (ext) => found.find((p) => p.toLowerCase().endsWith(ext));
        return byExt('.exe') || byExt('.cmd') || byExt('.bat') || found[0];
      }
      return found[0];
    }
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
}

export function getCachedBefore(db, websiteId) {
  const row = db.prepare('SELECT before_html, url FROM wireframes WHERE website_id = ?').get(websiteId);
  return row && row.before_html ? { before: row.before_html, url: row.url || '' } : null;
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
function ensureChangeMarker(before, after) {
  if (/data-ff-new/i.test(after)) return after;
  const beforeLines = new Set(String(before).split(/\r?\n/).map((l) => l.trim()));
  const afterLines = String(after).split(/\r?\n/);
  for (let i = 0; i < afterLines.length; i += 1) {
    const trimmed = afterLines[i].trim();
    if (!trimmed || beforeLines.has(trimmed)) continue;
    // Tag the first opening tag on this changed line (skip closing tags / comments).
    const replaced = afterLines[i].replace(/<([a-zA-Z][\w-]*)((?:\s[^>]*?)?)(\/?)>/, (m, tag, attrs, selfClose) => {
      if (/data-ff-new/i.test(m)) return m;
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
// both documents so the UI can show a before/after pair.
export async function applyFix(db, { websiteId, url, imagePath, painPointSummary, fixTitle, fixDescription }) {
  const before = await getOrCreateBefore(db, { websiteId, url, imagePath });
  const stdout = await runCopilot(
    buildAfterPrompt({ beforeHtml: before, painPointSummary, fixTitle, fixDescription })
  );
  const after = cleanHtml(extractAnswer(stdout));
  if (!after) throw new Error('Model returned no HTML for the proposed change.');
  return { before, after: ensureChangeMarker(before, after) };
}

// ── Slideshow walkthrough (Playwright) ─────────────────────────
// CSS injected before screenshotting so the change reads clearly in the slides.
// Only the element we explicitly tag with data-ff-mark is highlighted (so we can
// spotlight one change at a time), with a red outline, glow, and a "NEW" badge.
const SLIDE_MARKER_CSS =
  '[data-ff-mark]{position:relative !important;outline:3px solid #ef4444 !important;' +
  'outline-offset:3px !important;border-radius:6px !important;' +
  'box-shadow:0 0 0 6px rgba(239,68,68,.22) !important;}' +
  '[data-ff-mark]::after{content:"NEW";position:absolute;left:50%;top:-28px;' +
  'transform:translateX(-50%);background:#ef4444;color:#fff;' +
  'font:700 11px/1 ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:.08em;' +
  'padding:4px 9px;border-radius:6px;white-space:nowrap;z-index:2147483647;' +
  'box-shadow:0 4px 12px rgba(239,68,68,.45);pointer-events:none;}';

// Classify where an element sits on the 1280x900 design so captions can name the
// region ("top navigation bar", "left sidebar", …) in plain language.
function regionFor(box) {
  if (box.y < 80) return 'top navigation bar';
  if (box.x < 240) return 'left sidebar';
  if (box.x > 1040) return 'right panel';
  if (box.y > 760) return 'bottom of the page';
  return 'main content area';
}

// Turn a tagged control's raw DOM facts into a human description: a readable name
// with no emoji/symbol noise, the kind of control it is, and the verb to use it.
function describeChange({ text, aria, title, tag, role, type }) {
  const strip = (s) =>
    String(s || '')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[\u2190-\u27BF\u2B00-\u2BFF]/g, '')
      .replace(/\uFE0F/g, '')
      .replace(/\u200D/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const name = (strip(text) || strip(aria) || strip(title)).slice(0, 44);
  const noun =
    tag === 'a' ? 'link'
      : tag === 'button' || role === 'button' ? 'button'
      : tag === 'select' ? 'dropdown'
      : tag === 'textarea' ? 'field'
      : tag === 'input' ? (type === 'checkbox' || type === 'radio' ? 'option' : 'field')
      : 'control';
  const verb =
    tag === 'a' || tag === 'button' || role === 'button' ? 'Click'
      : type === 'checkbox' || type === 'radio' || role === 'switch' ? 'Toggle'
      : tag === 'input' || tag === 'textarea' || tag === 'select' ? 'Use'
      : 'Select';
  // e.g. "“Settings” button", or just "new button" when the control is icon-only.
  const label = name ? `“${name}” ${noun}` : `new ${noun}`;
  return { name, noun, verb, label };
}

// Render the generated AFTER html with a headless browser and capture an ordered
// set of slides: a clean overview, then for EACH change a "find it" full-page shot
// and a zoomed-in "use it" shot. Returns the slides (with deterministic captions as
// a fallback) plus the detected change list so the caller can request richer
// narration. Reuses the same Playwright/chromium setup as the live-page screenshots.
async function captureWalkthroughSlides(afterHtml, { websiteName, fixTitle, fixDescription }) {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: VIEWPORT });
    try {
      await page.setContent(afterHtml, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      await page.setContent(afterHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await page.addStyleTag({ content: SLIDE_MARKER_CSS });
    await page.waitForTimeout(300);

    const toDataUrl = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
    const slides = [];
    const changes = [];

    // 1) Clean overview — the new design in context (no marker shown yet).
    slides.push({
      kind: 'overview',
      slot: { beat: 'overview' },
      title: `The redesigned ${websiteName || 'experience'}`,
      caption: fixTitle
        ? `${fixTitle} — applied to the real design. Here is how a user discovers and uses it.`
        : 'The proposed change, applied to the real design.',
      image: toDataUrl(await page.screenshot({ fullPage: false })),
    });

    // 2) One "find it" + one "use it" slide per tagged change.
    const handles = await page.$$('[data-ff-new]');
    let step = 1;
    let changeIndex = 0;
    for (const handle of handles) {
      const box = await handle.boundingBox();
      if (!box) continue;
      const raw = await handle.evaluate((el) => ({
        text: (el.innerText || el.textContent || '').trim(),
        aria: el.getAttribute('aria-label') || '',
        title: el.getAttribute('title') || '',
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role') || '',
        type: el.getAttribute('type') || '',
      }));
      const region = regionFor(box);
      const d = describeChange(raw);
      changes.push({ ...d, region });

      // Spotlight just this element.
      await handle.evaluate((el) => el.setAttribute('data-ff-mark', 'true'));
      await page.waitForTimeout(120);

      // "Find it" — full page so the user can place the change in context.
      slides.push({
        kind: 'locate',
        slot: { beat: 'find', change: changeIndex },
        title: `Step ${step}: Find the ${d.label}`,
        caption: `The ${d.label} now sits in the ${region}, where users naturally look — no more digging through nested menus to solve this.`,
        image: toDataUrl(await page.screenshot({ fullPage: false })),
      });
      step += 1;

      // "Use it" — zoom into the control (clip around it, with padding for the badge).
      const pad = 64;
      const x = Math.max(0, box.x - pad);
      const y = Math.max(0, box.y - pad - 24);
      const clip = {
        x,
        y,
        width: Math.min(box.width + pad * 2, VIEWPORT.width - x),
        height: Math.min(box.height + pad * 2 + 24, VIEWPORT.height - y),
      };
      slides.push({
        kind: 'use',
        slot: { beat: 'use', change: changeIndex },
        title: `Step ${step}: ${d.verb} the ${d.label}`,
        caption: `${d.verb} the ${d.label} to ${fixDescription ? 'complete the task' : 'reach the feature'} in a single step. ${fixDescription || 'It is now an obvious, direct action.'}`,
        image: toDataUrl(await page.screenshot({ clip })),
      });
      step += 1;

      await handle.evaluate((el) => el.removeAttribute('data-ff-mark'));
      changeIndex += 1;
    }

    return { slides, changes };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// ── Simulated-usage GIF (frame-by-frame, no native deps) ───────
// We render the AFTER design, then drive a fake pointer to each change one frame at
// a time (deterministic — no reliance on video codecs or recording timing). Each
// frame is a screenshot we decode, downscale, and feed to a pure-JS GIF encoder, so
// the result is a plain animated GIF that embeds reliably as <img> anywhere.
const GIF_CURSOR_CSS =
  '[data-ff-mark]{outline:3px solid #ef4444 !important;outline-offset:3px !important;' +
  'border-radius:6px !important;box-shadow:0 0 0 6px rgba(239,68,68,.18) !important;}' +
  '#ff-cursor{position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;' +
  'will-change:transform;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));}' +
  '#ff-ripple{position:fixed;left:0;top:0;z-index:2147483646;width:48px;height:48px;' +
  'border-radius:50%;pointer-events:none;display:none;' +
  'background:radial-gradient(circle,rgba(59,130,246,.65),rgba(59,130,246,0) 70%);}';

const GIF_WIDTH = 760; // output GIF width; height scales to the 1280x900 design
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Area-average downscale of an RGBA buffer (sw×sh -> dw×dh). Keeps the GIF small
// and smooth without a native image library.
function downscaleRGBA(src, sw, sh, dw, dh) {
  const dst = new Uint8Array(dw * dh * 4);
  const xr = sw / dw;
  const yr = sh / dh;
  for (let y = 0; y < dh; y += 1) {
    const sy0 = Math.floor(y * yr);
    const sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * yr));
    for (let x = 0; x < dw; x += 1) {
      const sx0 = Math.floor(x * xr);
      const sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * xr));
      let r = 0; let g = 0; let b = 0; let a = 0; let n = 0;
      for (let sy = sy0; sy < sy1 && sy < sh; sy += 1) {
        for (let sx = sx0; sx < sx1 && sx < sw; sx += 1) {
          const i = (sy * sw + sx) * 4;
          r += src[i]; g += src[i + 1]; b += src[i + 2]; a += src[i + 3]; n += 1;
        }
      }
      const di = (y * dw + x) * 4;
      dst[di] = (r / n) | 0;
      dst[di + 1] = (g / n) | 0;
      dst[di + 2] = (b / n) | 0;
      dst[di + 3] = (a / n) | 0;
    }
  }
  return dst;
}

// Build the simulated-usage GIF. Returns a base64 image/gif data URL + change count.
async function captureWalkthroughGif(afterHtml) {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: VIEWPORT });
    try {
      await page.setContent(afterHtml, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      await page.setContent(afterHtml, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await page.addStyleTag({ content: GIF_CURSOR_CSS });

    // Inject the pointer + ripple. Movement is set explicitly per frame (no CSS
    // transition) so every captured frame is exactly where we want it.
    await page.evaluate(() => {
      const c = document.createElement('div');
      c.id = 'ff-cursor';
      c.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 24 24">' +
        '<path d="M4 2l15.5 7.6-6.7 1.7L9.6 20 4 2z" fill="#0f172a" stroke="#fff" ' +
        'stroke-width="1.4" stroke-linejoin="round"/></svg>';
      document.body.appendChild(c);
      const ripple = document.createElement('div');
      ripple.id = 'ff-ripple';
      document.body.appendChild(ripple);
      window.__ff = {
        frame(x, y, scale, rip) {
          c.style.transform = `translate(${x - 4}px,${y - 2}px) scale(${scale})`;
          if (rip > 0 && rip < 1) {
            ripple.style.display = 'block';
            ripple.style.transform = `translate(${x - 24}px,${y - 24}px) scale(${0.3 + rip * 2.4})`;
            ripple.style.opacity = String((1 - rip) * 0.6);
          } else {
            ripple.style.display = 'none';
          }
        },
      };
    });

    // Resolve the targets (viewport-relative centers of each tagged change).
    const handles = await page.$$('[data-ff-new]');
    const targets = [];
    for (const handle of handles.slice(0, 4)) {
      const rect = await handle.evaluate((el) => {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      });
      if (!rect || (rect.w === 0 && rect.h === 0)) continue;
      targets.push({ handle, cx: Math.round(rect.x + rect.w / 2), cy: Math.round(rect.y + rect.h / 2) });
    }

    // Collect frames as { rgba, delay }. We downscale immediately to cap memory.
    const dw = GIF_WIDTH;
    const dh = Math.round((VIEWPORT.height / VIEWPORT.width) * dw);
    const frames = [];
    const snap = async (delay) => {
      const png = await page.screenshot({ type: 'png' });
      const { data, width, height } = PNG.sync.read(png);
      frames.push({ rgba: downscaleRGBA(data, width, height, dw, dh), delay });
    };
    const setCursor = (x, y, scale, rip) =>
      page.evaluate(([px, py, s, r]) => window.__ff.frame(px, py, s, r), [x, y, scale, rip]);

    let pos = { x: Math.round(VIEWPORT.width * 0.5), y: Math.round(VIEWPORT.height * 0.74) };
    await setCursor(pos.x, pos.y, 1, 0);

    // Intro: hold on the clean design.
    for (let i = 0; i < 4; i += 1) await snap(140);

    for (const t of targets) {
      // Glide to the control.
      const from = pos;
      const STEPS = 10;
      for (let i = 1; i <= STEPS; i += 1) {
        const e = easeInOut(i / STEPS);
        const x = Math.round(from.x + (t.cx - from.x) * e);
        const y = Math.round(from.y + (t.cy - from.y) * e);
        await setCursor(x, y, 1, 0); // eslint-disable-line no-await-in-loop
        await snap(60); // eslint-disable-line no-await-in-loop
      }
      pos = { x: t.cx, y: t.cy };

      // Highlight the change.
      await t.handle.evaluate((el) => el.setAttribute('data-ff-mark', 'true'));
      for (let i = 0; i < 3; i += 1) await snap(120);

      // Click: ripple expands while the pointer presses in.
      const RIP = 6;
      for (let i = 1; i <= RIP; i += 1) {
        const r = i / RIP;
        await setCursor(pos.x, pos.y, i <= 2 ? 0.82 : 1, r); // eslint-disable-line no-await-in-loop
        await snap(70); // eslint-disable-line no-await-in-loop
      }
      await setCursor(pos.x, pos.y, 1, 0);

      // Dwell so the action registers, then clear the highlight.
      for (let i = 0; i < 5; i += 1) await snap(130);
      await t.handle.evaluate((el) => el.removeAttribute('data-ff-mark'));
      await snap(120);
    }

    if (!targets.length) {
      // Nothing tagged — drift the cursor so the GIF is not a static frame.
      const to = { x: Math.round(VIEWPORT.width * 0.5), y: Math.round(VIEWPORT.height * 0.42) };
      for (let i = 1; i <= 10; i += 1) {
        const e = easeInOut(i / 10);
        await setCursor(Math.round(pos.x + (to.x - pos.x) * e), Math.round(pos.y + (to.y - pos.y) * e), 1, 0); // eslint-disable-line no-await-in-loop
        await snap(80); // eslint-disable-line no-await-in-loop
      }
    }

    // Outro hold (also the loop seam).
    for (let i = 0; i < 4; i += 1) await snap(150);

    // Encode. Build one shared palette from sampled frames so colors stay stable
    // (no per-frame flicker) and the accent red/blue are represented.
    const sample = [];
    const stride = Math.max(1, Math.floor(frames.length / 6));
    for (let i = 0; i < frames.length; i += stride) sample.push(frames[i].rgba);
    const merged = new Uint8Array(sample.reduce((n, f) => n + f.length, 0));
    let off = 0;
    for (const f of sample) { merged.set(f, off); off += f.length; }
    const palette = quantize(merged, 256);

    const gif = GIFEncoder();
    for (const f of frames) {
      const index = applyPalette(f.rgba, palette);
      gif.writeFrame(index, dw, dh, { palette, delay: f.delay });
    }
    gif.finish();
    const buf = Buffer.from(gif.bytes());
    return { gif: `data:image/gif;base64,${buf.toString('base64')}`, changeCount: targets.length };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// Ask the isolated Copilot CLI to narrate the walkthrough for the detected changes,
// returning specific step captions. Returns null (callers keep the deterministic
// fallback captions) on any failure or malformed output.
async function narrateWalkthrough(ctx) {
  try {
    const stdout = await runCopilot(buildWalkthroughStepsPrompt(ctx));
    const json = parseStepsJson(extractAnswer(stdout));
    if (json && Array.isArray(json.steps)) return json;
  } catch {
    // narration is best-effort; deterministic captions remain
  }
  return null;
}

// Overlay model-written captions onto the captured slides (by slot), leaving the
// images untouched. Any missing field falls back to the deterministic caption.
function applyNarration(slides, narration) {
  if (!narration) return;
  for (const slide of slides) {
    const { beat, change } = slide.slot || {};
    if (beat === 'overview') {
      if (narration.overviewTitle) slide.title = narration.overviewTitle;
      if (narration.overviewCaption) slide.caption = narration.overviewCaption;
    } else if ((beat === 'find' || beat === 'use') && narration.steps?.[change]) {
      const s = narration.steps[change];
      if (beat === 'find') {
        if (s.findTitle) slide.title = s.findTitle;
        if (s.findCaption) slide.caption = s.findCaption;
      } else {
        if (s.useTitle) slide.title = s.useTitle;
        if (s.useCaption) slide.caption = s.useCaption;
      }
    }
  }
}

// Generate a slideshow walkthrough for a proposed change: apply the fix to get the
// AFTER html, screenshot it into an ordered set of slides, then ask the model to
// narrate specific, non-trivial step captions for the changes it detected.
export async function generateWalkthrough(db, opts) {
  const { after } = await applyFix(db, opts);
  const { slides, changes } = await captureWalkthroughSlides(after, {
    websiteName: opts.websiteName || '',
    fixTitle: opts.fixTitle || '',
    fixDescription: opts.fixDescription || '',
  });
  if (!slides.length) throw new Error('Could not capture any walkthrough slides.');
  if (changes.length) {
    const narration = await narrateWalkthrough({
      websiteName: opts.websiteName || '',
      painPointSummary: opts.painPointSummary || '',
      fixTitle: opts.fixTitle || '',
      fixDescription: opts.fixDescription || '',
      changes,
    });
    applyNarration(slides, narration);
  }
  // Strip internal slot metadata before sending to the client.
  return { slides: slides.map(({ slot: _slot, ...s }) => s), after };
}

// Generate a simulated-usage GIF for a proposed change: apply the fix to get the
// AFTER html, then render a fake cursor finding and "using" each change, frame by
// frame, encoded as an animated GIF that embeds reliably as an <img>.
export async function generateWalkthroughVideo(db, opts) {
  const { after } = await applyFix(db, opts);
  const { gif, changeCount } = await captureWalkthroughGif(after);
  if (!gif) throw new Error('Could not render the walkthrough GIF.');
  return { gif, changeCount, after };
}

// Ask the isolated Copilot CLI to write a developer-ready prompt (for an external AI
// coding assistant) that implements the proposed change. Returns the prompt text.
export async function generateDevPrompt(context) {
  const stdout = await runCopilot(buildDevPromptRequest(context));
  let text = String(extractAnswer(stdout) || '').trim();
  // Strip a wrapping markdown code fence if the model added one anyway.
  text = text.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  if (!text) throw new Error('Model returned no prompt text.');
  return text;
}

export { EPHEMERAL_HOME, MODEL };
