import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { feedbackEntries as seedFeedback, painPoints as curatedPainPoints, websites } from '../src/data/mockData.js';
import { clusterFeedback } from '../src/data/clustering.js';
import { ensureWireframeTable, getCachedBefore, getOrCreateBefore, applyFix, generateWalkthrough, generateDevPrompt, localScreenshotPath } from './wireframe-service.js';

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
app.get('/api/pain-points', (req, res) => {
  const { websiteId } = req.query;
  let ids;
  if (websiteId) {
    ids = [websiteId];
  } else {
    // Any website that has feedback, plus the seeded examples.
    const fromDb = db.prepare('SELECT DISTINCT website_id FROM feedback').all().map((r) => r.website_id);
    ids = [...new Set([...websites.map((w) => w.id), ...fromDb])];
  }
  const all = [];
  const stmt = db.prepare('SELECT * FROM feedback WHERE website_id = ? ORDER BY created_at DESC, rowid DESC');
  for (const id of ids) {
    const rows = stmt.all(id).map(toClient);
    all.push(...clusterFeedback(rows, id, curatedPainPoints));
  }
  res.json(all);
});

// ── Wireframes ─────────────────────────────────────────────────
// Resolve a website's live URL: explicit query/body wins, else the seed list.
const resolveUrl = (websiteId, override) =>
  override || websites.find((w) => w.id === websiteId)?.url || '';
// Resolve a website's bundled screenshot asset (preferred vision source).
const resolveImage = (websiteId) =>
  localScreenshotPath(websites.find((w) => w.id === websiteId)?.screenshotAsset);

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
    });
    res.json({ before, url: liveUrl, ready: true });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Generate the "after" wireframe on the fly: load the cached before, apply ONLY
// the proposed fix, and return both documents.
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
      painPointSummary: b.painPointSummary || '',
      fixTitle: String(b.fixTitle),
      fixDescription: b.fixDescription || '',
    });
    res.json({ before, after });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Generate a slideshow walkthrough: apply the fix, then Playwright-screenshot the
// resulting AFTER design into an ordered set of captioned slides (overview + a
// find-it / use-it pair per change).
app.post('/api/walkthrough', async (req, res) => {
  const b = req.body || {};
  if (!b.websiteId || !b.fixTitle) {
    return res.status(400).json({ error: 'websiteId and fixTitle are required' });
  }
  const liveUrl = resolveUrl(b.websiteId, b.url);
  try {
    const { slides, after } = await generateWalkthrough(db, {
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

app.post('/api/dev-prompt', async (req, res) => {
  const b = req.body || {};
  if (!b.fixTitle && !b.fixDescription) {
    return res.status(400).json({ error: 'fixTitle or fixDescription is required' });
  }
  try {
    const prompt = await generateDevPrompt({
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
});

app.listen(PORT, () => {
  console.log(`[api] feedback server listening on http://localhost:${PORT}`);
});
