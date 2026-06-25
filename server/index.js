import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { feedbackEntries as seedFeedback, painPoints as curatedPainPoints, websites } from '../src/data/mockData.js';
import { ensureWireframeTable, getCachedBefore, getOrCreateBefore, applyFix, getOrCreateScreenshot, localScreenshotPath, localHtmlPath, generateWalkthrough as generateSlideshowWalkthrough, generateDevPrompt as generateWireframeDevPrompt, generateWalkthroughVideo } from './wireframe-service.js';
import { assistFeedback } from './assist-service.js';
import { hasToken } from './github-models.js';
import {
  ensureCoalesceTable,
  coalesceFeedback,
  getCachedClusters,
} from './coalesce-service.js';
import {
  ensureSolutionTable,
  generateProcessFlow,
  generateWalkthrough,
  generateDevPrompt,
} from './solution-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ── Database (file-backed SQLite, built into Node 24) ──────────
const db = new DatabaseSync(path.join(__dirname, 'feedback.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id          TEXT PRIMARY KEY,
    website_id  TEXT NOT NULL,
    submitter   TEXT NOT NULL,
    role        TEXT,
    department  TEXT,
    rating      INTEGER,
    text        TEXT NOT NULL,
    category    TEXT,
    created_at  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_feedback_website ON feedback (website_id);
`);

// Wireframe cache table (before_html per website, generated from a screenshot).
ensureWireframeTable(db);

// AI pain-point cluster cache (semantic coalescing of feedback per website).
ensureCoalesceTable(db);

// AI-generated solution artifacts (process flows, walkthroughs) per pain point.
ensureSolutionTable(db);

// Seed the example feedback once, so dashboards aren't empty on first run.
const { c: existing } = db.prepare('SELECT COUNT(*) AS c FROM feedback').get();
if (existing === 0) {
  const insert = db.prepare(`
    INSERT INTO feedback (id, website_id, submitter, role, department, rating, text, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const f of seedFeedback) {
    insert.run(
      f.id,
      f.websiteId,
      f.submitter,
      f.role || 'employee',
      f.department || '',
      f.rating ?? 3,
      f.text,
      (f.tags && f.tags[0]) || 'general',
      `${f.date}T09:00:00.000Z`
    );
  }
  console.log(`[db] seeded ${seedFeedback.length} example feedback rows`);
}

const toClient = (row) => ({
  id: row.id,
  websiteId: row.website_id,
  submitter: row.submitter,
  role: row.role,
  department: row.department,
  rating: row.rating,
  text: row.text,
  category: row.category,
  date: (row.created_at || '').slice(0, 10),
  createdAt: row.created_at,
});

// ── API ────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// List feedback (optionally scoped to a website), newest first.
app.get('/api/feedback', (req, res) => {
  const { websiteId } = req.query;
  const rows = websiteId
    ? db
        .prepare('SELECT * FROM feedback WHERE website_id = ? ORDER BY created_at DESC, rowid DESC')
        .all(websiteId)
    : db.prepare('SELECT * FROM feedback ORDER BY created_at DESC, rowid DESC').all();
  res.json(rows.map(toClient));
});

// Create feedback from a form submission.
app.post('/api/feedback', (req, res) => {
  const b = req.body || {};
  if (!b.websiteId || !b.submitter || !b.text) {
    return res.status(400).json({ error: 'websiteId, submitter and text are required' });
  }
  const id = `fb-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO feedback (id, website_id, submitter, role, department, rating, text, category, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    String(b.websiteId),
    String(b.submitter),
    b.role || 'employee',
    b.department || '',
    Number.isFinite(+b.rating) ? +b.rating : 3,
    String(b.text),
    b.category || 'general',
    createdAt
  );
  res.status(201).json(toClient(db.prepare('SELECT * FROM feedback WHERE id = ?').get(id)));
});

// Pain points — clustered live from the database, not hardcoded.
//
// GET /api/pain-points → AI-coalesced pain points.
//
// Response shape: { analyzing: boolean, error: string|null, painPoints: [...] }.
//
// The pain points come from the model only — we NEVER show the keyword heuristic
// to users (it produced confusing, unrelated clusters). On a cache miss for a
// specific website we run the model inline and return its clusters; if the model
// can't run we return an explicit error rather than a heuristic. For the
// all-websites view we serve whatever is already cached (no inline generation),
// since each site is generated when its dashboard is opened.
const coalesceInFlight = new Map();
function coalesceOnce(websiteId, rows) {
  const existing = coalesceInFlight.get(websiteId);
  if (existing) return existing;
  const p = coalesceFeedback(db, {
    feedback: rows,
    websiteId,
    curatedPainPoints,
    allowFallback: false, // throw instead of falling back to the heuristic
  }).finally(() => coalesceInFlight.delete(websiteId));
  coalesceInFlight.set(websiteId, p);
  return p;
}

app.get('/api/pain-points', async (req, res) => {
  const { websiteId } = req.query;
  const single = !!websiteId;
  let ids;
  if (single) {
    ids = [websiteId];
  } else {
    const fromDb = db.prepare('SELECT DISTINCT website_id FROM feedback').all().map((r) => r.website_id);
    ids = [...new Set([...websites.map((w) => w.id), ...fromDb])];
  }

  const stmt = db.prepare('SELECT * FROM feedback WHERE website_id = ? ORDER BY created_at DESC, rowid DESC');
  const painPoints = [];
  let error = null;

  for (const id of ids) {
    const rows = stmt.all(id).map(toClient);
    if (!rows.length) continue;
    const cached = getCachedClusters(db, id, rows);
    if (cached) {
      painPoints.push(...cached);
      continue;
    }
    // Only generate inline for an explicitly requested website, so the
    // all-websites view stays fast and never blocks on the model.
    if (!single) continue;
    if (!hasToken()) {
      error = 'AI analysis unavailable: set GITHUB_TOKEN on the server to analyze feedback.';
      continue;
    }
    try {
      painPoints.push(...(await coalesceOnce(id, rows)));
    } catch {
      error = 'AI analysis failed while clustering this feedback. Please try again.';
    }
  }

  res.json({ analyzing: false, error, painPoints });
});

// Real-time feedback assistant: score + nudges + quick-insert suggestions from a
// low-latency model (GitHub Models). Returns { ok:false } on any failure so the
// client keeps its instant heuristic output. The token lives only on the server.
app.post('/api/assist', async (req, res) => {
  const { text, category, hasImages } = req.body || {};
  if (!text || !String(text).trim()) return res.json({ ok: false });
  try {
    const result = await assistFeedback({
      text: String(text),
      category,
      hasImages: !!hasImages,
    });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.json({ ok: false, error: String(e?.message || e) });
  }
});

// ── Wireframes ─────────────────────────────────────────────────
// Resolve a website's live URL: explicit query/body wins, else the seed list.
const resolveUrl = (websiteId, override) =>
  override || websites.find((w) => w.id === websiteId)?.url || '';
// Resolve a website's bundled screenshot asset (preferred vision source).
const resolveImage = (websiteId) =>
  localScreenshotPath(websites.find((w) => w.id === websiteId)?.screenshotAsset);
// Resolve a website's bundled curated "before" HTML (used verbatim, no screenshot)
// for pages that block headless capture (e.g. support.microsoft.com).
const resolveHtml = (websiteId) =>
  localHtmlPath(websites.find((w) => w.id === websiteId)?.beforeHtmlAsset);

// Return the pre-generated "before" wireframe for a website, generating + caching
// it (screenshot -> faithful HTML) on first use.
app.get('/api/wireframe', async (req, res) => {
  const { websiteId, url } = req.query;
  if (!websiteId) return res.status(400).json({ error: 'websiteId is required' });
  const liveUrl = resolveUrl(websiteId, url);
  // Fast path: report whether a before is already cached without generating.
  const cached = getCachedBefore(db, websiteId);
  if (cached) return res.json({ before: cached.before, url: cached.url || liveUrl, ready: true });
  try {
    const before = await getOrCreateBefore(db, {
      websiteId,
      url: liveUrl,
      imagePath: resolveImage(websiteId),
      htmlPath: resolveHtml(websiteId),
    });
    res.json({ before, url: liveUrl, ready: true });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Capture the live page as a screenshot (base64 data URL), cached per website.
// Powers the "Live page" toggle in the Before panel so users can compare the
// proposed fix against the real current page, not just the reconstructed wireframe.
app.get('/api/wireframe/screenshot', async (req, res) => {
  const { websiteId, url, refresh } = req.query;
  if (!websiteId) return res.status(400).json({ error: 'websiteId is required' });
  const liveUrl = resolveUrl(websiteId, url);
  try {
    const image = await getOrCreateScreenshot(db, {
      websiteId,
      url: liveUrl,
      imagePath: resolveImage(websiteId),
      refresh: refresh === '1' || refresh === 'true',
    });
    res.json({ image, url: liveUrl });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Generate the "after" wireframe on the fly: load the cached before, apply ONLY
// the proposed fix, and return both documents. An optional `refinement` note lets
// the user correct a wrong result ("put the gear top-right") and regenerate.
app.post('/api/wireframe/after', async (req, res) => {
  const b = req.body || {};
  if (!b.websiteId || !b.fixTitle) {
    return res.status(400).json({ error: 'websiteId and fixTitle are required' });
  }
  const liveUrl = resolveUrl(b.websiteId, b.url);
  try {
    const { before, after } = await applyFix(db, {
      websiteId: String(b.websiteId),
      url: liveUrl,
      imagePath: resolveImage(b.websiteId),
      htmlPath: resolveHtml(b.websiteId),
      painPointSummary: b.painPointSummary || '',
      fixTitle: String(b.fixTitle),
      fixDescription: b.fixDescription || '',
      refinement: b.refinement || '',
    });
    res.json({ before, after });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Generate a slideshow walkthrough: apply the fix, then Playwright-screenshot the
// resulting AFTER design into an ordered set of captioned slides (overview + a
// find-it / use-it pair per change).
app.post('/api/walkthrough/slideshow', async (req, res) => {
  const b = req.body || {};
  if (!b.websiteId || !b.fixTitle) {
    return res.status(400).json({ error: 'websiteId and fixTitle are required' });
  }
  const liveUrl = resolveUrl(b.websiteId, b.url);
  try {
    const { slides, after } = await generateSlideshowWalkthrough(db, {
      websiteId: String(b.websiteId),
      url: liveUrl,
      imagePath: resolveImage(b.websiteId),
      websiteName: websites.find((w) => w.id === b.websiteId)?.name || '',
      painPointSummary: b.painPointSummary || '',
      fixTitle: String(b.fixTitle),
      fixDescription: b.fixDescription || '',
    });
    res.json({ slides, after });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Generate a simulated-usage GIF: apply the fix, then render a fake cursor finding
// and "using" each change frame by frame, returned as an animated GIF data URL.
app.post('/api/walkthrough-video', async (req, res) => {
  const b = req.body || {};
  if (!b.websiteId || !b.fixTitle) {
    return res.status(400).json({ error: 'websiteId and fixTitle are required' });
  }
  const liveUrl = resolveUrl(b.websiteId, b.url);
  try {
    const { gif, changeCount, after } = await generateWalkthroughVideo(db, {
      websiteId: String(b.websiteId),
      url: liveUrl,
      imagePath: resolveImage(b.websiteId),
      websiteName: websites.find((w) => w.id === b.websiteId)?.name || '',
      painPointSummary: b.painPointSummary || '',
      fixTitle: String(b.fixTitle),
      fixDescription: b.fixDescription || '',
    });
    res.json({ gif, changeCount, after });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ── AI-generated solution artifacts (per pain point) ───────────────────────
// Both endpoints take the pain point itself so they work for ANY pain point —
// curated or AI-clustered — not just the bundled demo solutions. Results are
// cached server-side per pain point, so repeated visits are instant + stable.
app.post('/api/process-flow', async (req, res) => {
  const { painPoint, websiteName, refinement } = req.body || {};
  if (!painPoint?.id) return res.status(400).json({ error: 'painPoint is required' });
  if (!hasToken()) return res.status(503).json({ error: 'AI unavailable: set GITHUB_TOKEN on the server.' });
  try {
    const flow = await generateProcessFlow(db, { painPoint, websiteName, refinement });
    res.json({ flow });
  } catch (e) {
    res.status(502).json({ error: String(e?.message || e) });
  }
});

app.post('/api/walkthrough', async (req, res) => {
  const { painPoint, websiteName, refinement } = req.body || {};
  if (!painPoint?.id) return res.status(400).json({ error: 'painPoint is required' });
  if (!hasToken()) return res.status(503).json({ error: 'AI unavailable: set GITHUB_TOKEN on the server.' });
  try {
    const walkthrough = await generateWalkthrough(db, { painPoint, websiteName, refinement });
    res.json({ walkthrough });
  } catch (e) {
    res.status(502).json({ error: String(e?.message || e) });
  }
});

// Generate a paste-ready prompt an engineer can drop into Copilot / Claude /
// Cursor to implement the fix in their own codebase. Supports two calling modes:
// - { painPoint } (from DevPromptButton): uses GitHub Models via solution-service.
// - { fixTitle, fixDescription, ... } (from AIPromptPanel): uses Copilot CLI via
//   wireframe-service for richer, wireframe-context-aware refinement.
app.post('/api/dev-prompt', async (req, res) => {
  const b = req.body || {};
  if (b.painPoint?.id) {
    // Pain-point path: solution-service (GitHub Models, cached).
    if (!hasToken()) return res.status(503).json({ error: 'AI unavailable: set GITHUB_TOKEN on the server.' });
    try {
      const result = await generateDevPrompt(db, { painPoint: b.painPoint, websiteName: b.websiteName, url: b.url, refinement: b.refinement });
      res.json(result);
    } catch (e) {
      res.status(502).json({ error: String(e?.message || e) });
    }
  } else {
    // Wireframe/flow context path: wireframe-service (Copilot CLI).
    if (!b.fixTitle && !b.fixDescription) {
      return res.status(400).json({ error: 'fixTitle or fixDescription is required' });
    }
    try {
      const prompt = await generateWireframeDevPrompt({
        kind: b.kind || 'wireframe',
        websiteName: b.websiteName || '',
        url: b.url || '',
        painPointSummary: b.painPointSummary || '',
        fixTitle: b.fixTitle || '',
        fixDescription: b.fixDescription || '',
      });
      res.json({ prompt });
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`[api] feedback server listening on http://localhost:${PORT}`);
});
