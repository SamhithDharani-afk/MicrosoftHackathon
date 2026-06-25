// Warm the wireframe cache: for every seed website, screenshot its live URL and
// generate the faithful "before" HTML, storing it in the SQLite DB so the demo
// shows the before instantly (the expensive vision call is done ahead of time).
//
// Run with: npm run pregen
//
// Already-cached websites are skipped, so this is safe to re-run. The on-the-fly
// GET /api/wireframe endpoint performs the same generation lazily for anything
// not pre-generated here.

import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { websites } from '../src/data/mockData.js';
import { ensureWireframeTable, getCachedBefore, getOrCreateBefore, localScreenshotPath } from './wireframe-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, 'feedback.db'));
ensureWireframeTable(db);

const targets = websites.filter((w) => w.url || w.screenshotAsset);
console.log(`[pregen] ${targets.length} website(s) with a URL or bundled screenshot`);

for (const site of targets) {
  if (getCachedBefore(db, site.id)) {
    console.log(`[pregen] ✓ ${site.id} already cached — skipping`);
    continue;
  }
  const imagePath = localScreenshotPath(site.screenshotAsset);
  const source = imagePath ? `asset:${site.screenshotAsset}` : site.url;
  const started = Date.now();
  process.stdout.write(`[pregen] … ${site.id} (${source}) `);
  try {
    const before = await getOrCreateBefore(db, { websiteId: site.id, url: site.url, imagePath });
    console.log(`done — ${before.length} chars in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  } catch (e) {
    console.log(`FAILED — ${e.message}`);
  }
}

console.log('[pregen] complete');
process.exit(0);
