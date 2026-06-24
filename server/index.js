// Feedback Platform API server (Express).
// Run with: npm run server   (or `npm run dev:all` to run web + api together)
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { getFeedback, addFeedback } from './store.js';
import { painPoints, wireframes, processFlows, walkthroughs } from '../src/data/mockData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, 'uploads');
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// --- File upload (screenshots / attachments) ---
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Never trust the client filename for the path — generate our own and keep only a sanitized extension.
    const ext = extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type. Allowed: PNG, JPG, GIF, WEBP, PDF.'));
  },
});

// --- Feedback endpoints ---
app.get('/api/feedback', (_req, res) => {
  res.json(getFeedback());
});

app.post('/api/feedback', upload.single('screenshot'), (req, res) => {
  const b = req.body ?? {};
  if (!b.name?.trim() || !b.feedback?.trim()) {
    return res.status(400).json({ error: 'Name and feedback are required.' });
  }
  const ratingNum = Number(b.rating);
  const entry = {
    id: `fb-${randomUUID().slice(0, 8)}`,
    submitter: b.name.trim(),
    role: b.role || 'employee',
    department: b.department || '',
    category: b.category || 'general',
    url: b.url || '',
    frequency: b.frequency || 'first-time',
    rating: Number.isFinite(ratingNum) ? Math.min(5, Math.max(1, ratingNum)) : 3,
    text: b.feedback.trim(),
    suggestedFix: b.suggestedFix || '',
    screenshotUrl: req.file ? `/uploads/${req.file.filename}` : null,
    date: new Date().toISOString().slice(0, 10),
    tags: [],
  };
  addFeedback(entry);
  res.status(201).json(entry);
});

// --- Read-only AI artifacts ---
app.get('/api/painpoints', (_req, res) => res.json(painPoints));

app.get('/api/painpoints/:id', (req, res) => {
  const pp = painPoints.find((p) => p.id === req.params.id);
  if (!pp) return res.status(404).json({ error: 'Pain point not found.' });
  res.json(pp);
});

app.get('/api/wireframes/:id', (req, res) => {
  const wf = wireframes[req.params.id];
  if (!wf) return res.status(404).json({ error: 'Wireframe not found.' });
  res.json(wf);
});

app.get('/api/process-flows/:id', (req, res) => {
  const pf = processFlows[req.params.id];
  if (!pf) return res.status(404).json({ error: 'Process flow not found.' });
  res.json(pf);
});

app.get('/api/walkthroughs/:id', (req, res) => {
  const wt = walkthroughs[req.params.id];
  if (!wt) return res.status(404).json({ error: 'Walkthrough not found.' });
  res.json(wt);
});

// --- Error handler (multer + validation) ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.message || 'Request failed.' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
