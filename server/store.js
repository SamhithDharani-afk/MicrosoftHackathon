// Lightweight JSON-file persistence for feedback submissions.
// Read-only "AI artifacts" (pain points, wireframes, flows, walkthroughs) are
// served directly from the seed module; only feedback is mutable, so only it is persisted here.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feedbackEntries } from '../src/data/mockData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const DB_PATH = join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) {
    // Seed the store with the existing mock feedback on first run.
    writeFileSync(DB_PATH, JSON.stringify({ feedback: feedbackEntries }, null, 2));
  }
}

function read() {
  ensureDb();
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function write(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function getFeedback() {
  return read().feedback;
}

export function addFeedback(entry) {
  const db = read();
  db.feedback.unshift(entry); // newest first
  write(db);
  return entry;
}
