import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { feedbackEntries as seedFeedback } from '../src/data/mockData.js';

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

app.listen(PORT, () => {
  console.log(`[api] feedback server listening on http://localhost:${PORT}`);
});
