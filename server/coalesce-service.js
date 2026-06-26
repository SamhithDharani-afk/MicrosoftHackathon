// Pain-Point Coalescer — real-AI clustering of a website's feedback.
//
// Replaces the keyword TOPICS matching in src/data/clustering.js with a semantic
// model call (via the isolated Copilot CLI — Copilot Pro, no GitHub token needed,
// the SAME token-free path the wireframes and solution artifacts use): it groups a
// website's raw feedback into distinct pain points, reusing a curated pain point's
// rich content when the theme genuinely matches one. The model only decides the
// GROUPING (which feedback belongs together + an optional curated mapping +
// emergent title/summary/root cause); the impact score, severity, departments and
// related-feedback list are still computed deterministically by the shared
// builders, so the output is byte-compatible with the heuristic clusterFeedback().
//
// Results are cached in SQLite keyed by website + a hash of the feedback set, so
// the model runs only when the feedback actually changes. Any failure (CLI
// unavailable, timeout, bad JSON) is surfaced to the caller, which falls back to
// the deterministic clusterFeedback().

import { createHash } from 'node:crypto';
import { runCopilotJSON } from './wireframe-service.js';
import { curatedPainPoint, emergentPainPoint, clusterFeedback } from '../src/data/clustering.js';

export function ensureCoalesceTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pain_point_clusters (
      website_id    TEXT PRIMARY KEY,
      feedback_hash TEXT NOT NULL,
      json          TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );
  `);
}

// Stable fingerprint of a website's feedback set: changes whenever a row is
// added/edited/removed, so the cache invalidates exactly when it should.
export function feedbackHash(feedback) {
  const h = createHash('sha1');
  for (const f of feedback) {
    h.update(`${f.id}\u0000${f.rating ?? ''}\u0000${f.category ?? ''}\u0000${f.department ?? ''}\u0000${f.text ?? ''}\u0001`);
  }
  return h.digest('hex');
}

function slug(text, fallback) {
  const s = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return s || fallback;
}

function buildPrompt(feedback, curatedForSite) {
  const items = feedback.slice(0, 200).map((f) => ({
    id: f.id,
    rating: f.rating ?? 3,
    category: f.category || 'general',
    department: f.department || '',
    text: String(f.text || '').slice(0, 400),
  }));
  const curated = curatedForSite.map((p) => ({ id: p.id, title: p.title, summary: p.summary }));

  return (
    `You are clustering raw product feedback into distinct PAIN POINTS for one ` +
    `website.\n\n` +
    `CURATED pain points already defined for this website (reuse one ONLY when a ` +
    `cluster genuinely matches it):\n${JSON.stringify(curated)}\n\n` +
    `FEEDBACK to cluster (each has a unique id):\n${JSON.stringify(items)}\n\n` +
    `Group the feedback into a small number of distinct pain points (themes). ` +
    `Every feedback id must be assigned to exactly one cluster; do not invent ids.\n\n` +
    `Return ONLY a JSON object:\n` +
    `{ "clusters": [ {\n` +
    `  "curatedId": "<id from the curated list, or null if none fits>",\n` +
    `  "title": "<concise pain-point title>",\n` +
    `  "summary": "<1-2 sentence summary of the shared problem>",\n` +
    `  "rootCause": "<one actionable sentence on the likely root cause>",\n` +
    `  "feedbackIds": ["<id>", ...]\n` +
    `} ] }\n\n` +
    `Rules: merge feedback describing the same underlying problem even if worded ` +
    `differently; keep clusters genuinely distinct; set curatedId only on a real ` +
    `match, otherwise null. Output JSON only.`
  );
}

// Turn the model's grouping into pain points using the shared deterministic
// builders. Unknown / duplicate ids are ignored; any leftover feedback is kept
// in a single "general usability" emergent cluster so nothing is dropped.
function buildPainPoints(clusters, { feedback, websiteId, curatedById, curatedForSiteIds }) {
  const byId = new Map(feedback.map((f) => [f.id, f]));
  const assigned = new Set();
  const painPoints = [];
  const usedKeys = new Set();

  for (const cluster of Array.isArray(clusters) ? clusters : []) {
    const ids = Array.isArray(cluster?.feedbackIds) ? cluster.feedbackIds : [];
    const items = [];
    for (const id of ids) {
      if (assigned.has(id)) continue; // first cluster to claim an id wins
      const item = byId.get(id);
      if (item) {
        items.push(item);
        assigned.add(id);
      }
    }
    if (!items.length) continue;

    const curatedId = cluster?.curatedId;
    const curated =
      curatedId && curatedForSiteIds.has(curatedId) ? curatedById.get(curatedId) : null;

    if (curated) {
      painPoints.push(curatedPainPoint({ curated, websiteId, items }));
    } else {
      let key = slug(cluster?.title, `theme-${painPoints.length}`);
      while (usedKeys.has(key)) key += `-${painPoints.length}`;
      usedKeys.add(key);
      painPoints.push(
        emergentPainPoint({
          websiteId,
          key,
          label: cluster?.title,
          items,
          title: typeof cluster?.title === 'string' ? cluster.title.trim() || undefined : undefined,
          summary: typeof cluster?.summary === 'string' ? cluster.summary.trim() || undefined : undefined,
          rootCause:
            typeof cluster?.rootCause === 'string' ? cluster.rootCause.trim() || undefined : undefined,
        })
      );
    }
  }

  // Keep any feedback the model failed to assign.
  const leftovers = feedback.filter((f) => !assigned.has(f.id));
  if (leftovers.length) {
    painPoints.push(emergentPainPoint({ websiteId, key: 'other', label: 'general usability', items: leftovers }));
  }

  return painPoints.sort((a, b) => b.impactScore - a.impactScore);
}

// Coalesce a website's feedback into pain points with real AI, cached per
// feedback set.
//
// `allowFallback` controls what happens when the model can't run (CLI
// unavailable, timeout, bad JSON). When true (default) we silently return the
// deterministic clusterFeedback() — handy for offline scripts. When false we
// THROW, so the API layer can surface a clean "analyzing/unavailable" state
// instead of ever showing the keyword heuristic to users (which produced
// confusing, unrelated pain points like "in-meeting controls" for a logo
// complaint).
export async function coalesceFeedback(
  db,
  { feedback, websiteId, curatedPainPoints = [], allowFallback = true }
) {
  if (!feedback || feedback.length === 0) return [];

  const hash = feedbackHash(feedback);
  const cached = db
    .prepare('SELECT feedback_hash, json FROM pain_point_clusters WHERE website_id = ?')
    .get(websiteId);
  if (cached && cached.feedback_hash === hash) {
    try {
      return JSON.parse(cached.json);
    } catch {
      // corrupt cache row — regenerate below
    }
  }

  const curatedForSite = curatedPainPoints.filter((p) => p.websiteId === websiteId);
  const curatedById = new Map(curatedPainPoints.map((p) => [p.id, p]));
  const curatedForSiteIds = new Set(curatedForSite.map((p) => p.id));

  let painPoints;
  try {
    // Cluster through the isolated Copilot CLI (no GitHub token required).
    const out = await runCopilotJSON(
      'You are a precise product-feedback analyst. You always return strict JSON ' +
        'matching the requested schema and never add commentary.\n\n' +
        buildPrompt(feedback, curatedForSite)
    );
    painPoints = buildPainPoints(out?.clusters, {
      feedback,
      websiteId,
      curatedById,
      curatedForSiteIds,
    });
  } catch (err) {
    // CLI unavailable / timeout / bad JSON.
    if (!allowFallback) throw err;
    // Deterministic fallback (not cached, so a later request can still upgrade).
    return clusterFeedback(feedback, websiteId, curatedPainPoints);
  }

  if (!painPoints.length) {
    if (!allowFallback) throw new Error('AI returned no clusters');
    return clusterFeedback(feedback, websiteId, curatedPainPoints);
  }

  db.prepare(`
    INSERT INTO pain_point_clusters (website_id, feedback_hash, json, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(website_id) DO UPDATE SET
      feedback_hash = excluded.feedback_hash,
      json = excluded.json,
      created_at = excluded.created_at
  `).run(websiteId, hash, JSON.stringify(painPoints), new Date().toISOString());

  return painPoints;
}

// True when a website's cached AI clusters are already up to date for the given
// feedback set — lets the route decide whether to background-generate.
export function isCoalesceFresh(db, websiteId, feedback) {
  if (!feedback || feedback.length === 0) return true;
  const row = db
    .prepare('SELECT feedback_hash FROM pain_point_clusters WHERE website_id = ?')
    .get(websiteId);
  return !!row && row.feedback_hash === feedbackHash(feedback);
}

export function getCachedClusters(db, websiteId, feedback) {
  const row = db
    .prepare('SELECT feedback_hash, json FROM pain_point_clusters WHERE website_id = ?')
    .get(websiteId);
  if (!row) return null;
  if (feedback && row.feedback_hash !== feedbackHash(feedback)) return null;
  try {
    return JSON.parse(row.json);
  } catch {
    return null;
  }
}
