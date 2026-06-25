// On-demand AI generation of "solution" artifacts for a pain point:
//   - process-flow : a before/after user-journey diagram (structured, the client
//                     lays it out with ReactFlow)
//   - walkthrough   : a step-by-step guide to the proposed fix
//
// Both are latency-tolerant (the user explicitly clicks "Generate"), so they use
// the same GitHub Models client (gpt-4o-mini) as the coalescer. Results are
// cached in SQLite keyed by the pain point id + a hash of its text, so a given
// pain point generates once and stays stable (no flip-flop) until its underlying
// feedback — and therefore its title/summary/root cause — changes.

import { createHash } from 'node:crypto';
import { chatJSON } from './github-models.js';

export function ensureSolutionTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS generated_solutions (
      painpoint_id TEXT NOT NULL,
      kind         TEXT NOT NULL,
      hash         TEXT NOT NULL,
      json         TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      PRIMARY KEY (painpoint_id, kind)
    );
  `);
}

function painPointHash(pp) {
  return createHash('sha1')
    .update(`${pp.title || ''}\u0000${pp.summary || ''}\u0000${pp.rootCause || ''}`)
    .digest('hex');
}

function getCached(db, painPointId, kind, hash) {
  const row = db
    .prepare('SELECT hash, json FROM generated_solutions WHERE painpoint_id = ? AND kind = ?')
    .get(painPointId, kind);
  if (!row || row.hash !== hash) return null;
  try {
    return JSON.parse(row.json);
  } catch {
    return null;
  }
}

function putCache(db, painPointId, kind, hash, value) {
  db.prepare(`
    INSERT INTO generated_solutions (painpoint_id, kind, hash, json, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(painpoint_id, kind) DO UPDATE SET
      hash = excluded.hash,
      json = excluded.json,
      created_at = excluded.created_at
  `).run(painPointId, kind, hash, JSON.stringify(value), new Date().toISOString());
}

const str = (v, fallback = '') => (typeof v === 'string' && v.trim() ? v.trim() : fallback);

// When the user asks to regenerate with a correction, this note is woven into the
// prompt at high priority so the new result addresses what was wrong last time.
function refineBlock(refinement) {
  const note = str(refinement);
  return note
    ? `IMPORTANT CORRECTION FROM THE REVIEWER (the previous version was not right — ` +
      `prioritize this): '${note}'.\n\n`
    : '';
}

const clampList = (v, min, max, fallback) => {
  const list = (Array.isArray(v) ? v : [])
    .map((s) => str(s))
    .filter(Boolean)
    .slice(0, max);
  while (list.length < min) list.push(fallback[list.length] || fallback[fallback.length - 1] || '…');
  return list;
};

// ── Process flow ──────────────────────────────────────────────────────────
function buildFlowPrompt(pp, websiteName, refinement) {
  return (
    `You are designing a BEFORE/AFTER user-journey diagram that contrasts the ` +
    `current broken experience with a proposed fix for a product pain point on ` +
    `"${websiteName || 'the product'}".\n\n` +
    `PAIN POINT:\n` +
    `- Title: ${pp.title || ''}\n` +
    `- Summary: ${pp.summary || ''}\n` +
    `- Root cause: ${pp.rootCause || ''}\n\n` +
    refineBlock(refinement) +
    `Return ONLY a JSON object describing the journey:\n` +
    `{\n` +
    `  "title": "<short flow title>",\n` +
    `  "description": "<1-2 sentences contrasting the old and new journeys>",\n` +
    `  "start": "<what the user is trying to do, <=8 words>",\n` +
    `  "oldLabel": "<short label for the broken path, e.g. 'Hidden, 4+ clicks'>",\n` +
    `  "oldSteps": ["<step>", "<step>", "<step>"],\n` +
    `  "newLabel": "<short label for the fixed path, e.g. 'Visible, 1 click'>",\n` +
    `  "newSteps": ["<step>", "<step>"],\n` +
    `  "outcome": "<the positive end result, may include a metric>"\n` +
    `}\n\n` +
    `Rules: oldSteps and newSteps each have 2-4 short imperative steps (<=8 words ` +
    `each). The last oldStep should convey user frustration; the last newStep the ` +
    `quick success. Keep it specific to THIS pain point. Output JSON only.`
  );
}

function normalizeFlow(out, pp) {
  return {
    title: str(out?.title, pp.title || 'Proposed Flow'),
    description: str(out?.description, pp.summary || ''),
    start: str(out?.start, 'User runs into the problem'),
    oldLabel: str(out?.oldLabel, 'Current experience'),
    oldSteps: clampList(out?.oldSteps, 2, 4, ['User hits the issue', 'Gives up frustrated']),
    newLabel: str(out?.newLabel, 'Proposed experience'),
    newSteps: clampList(out?.newSteps, 2, 4, ['User finds the fix', 'Task done quickly']),
    outcome: str(out?.outcome, 'Problem resolved'),
  };
}

export async function generateProcessFlow(db, { painPoint, websiteName, refinement }) {
  const hash = painPointHash(painPoint);
  // A refinement is an explicit "this was wrong, try again" — always regenerate,
  // then overwrite the cache so the corrected version persists on later visits.
  if (!refinement) {
    const cached = getCached(db, painPoint.id, 'process-flow', hash);
    if (cached) return cached;
  }

  const out = await chatJSON({
    system:
      'You are a precise UX flow designer. You always return strict JSON matching ' +
      'the requested schema and never add commentary.',
    user: buildFlowPrompt(painPoint, websiteName, refinement),
    temperature: 0.3,
    maxTokens: 900,
    timeoutMs: 30000,
  });
  const flow = normalizeFlow(out, painPoint);
  putCache(db, painPoint.id, 'process-flow', hash, flow);
  return flow;
}

// ── Walkthrough ───────────────────────────────────────────────────────────
function buildWalkthroughPrompt(pp, websiteName, refinement) {
  return (
    `You are writing a short, friendly step-by-step walkthrough that guides a user ` +
    `through the PROPOSED FIX for a product pain point on ` +
    `"${websiteName || 'the product'}".\n\n` +
    `PAIN POINT:\n` +
    `- Title: ${pp.title || ''}\n` +
    `- Summary: ${pp.summary || ''}\n` +
    `- Root cause: ${pp.rootCause || ''}\n\n` +
    refineBlock(refinement) +
    `Return ONLY a JSON object:\n` +
    `{ "title": "<walkthrough title>",\n` +
    `  "steps": [ { "title": "<step title>", "description": "<1-2 sentence ` +
    `instruction describing what the user sees/does with the new design>" } ] }\n\n` +
    `Rules: 3-5 steps. Describe the IMPROVED experience (the fix in action), not ` +
    `the old broken one. Keep it concrete and specific to this pain point. Output ` +
    `JSON only.`
  );
}

function normalizeWalkthrough(out, pp) {
  const steps = (Array.isArray(out?.steps) ? out.steps : [])
    .map((s) => ({ title: str(s?.title), description: str(s?.description) }))
    .filter((s) => s.title || s.description)
    .slice(0, 6);
  if (!steps.length) {
    steps.push({
      title: 'Review the proposed fix',
      description: pp.summary || 'Explore the recommended change for this pain point.',
    });
  }
  return { title: str(out?.title, `${pp.title || 'Solution'} Walkthrough`), steps };
}

export async function generateWalkthrough(db, { painPoint, websiteName, refinement }) {
  const hash = painPointHash(painPoint);
  if (!refinement) {
    const cached = getCached(db, painPoint.id, 'walkthrough', hash);
    if (cached) return cached;
  }

  const out = await chatJSON({
    system:
      'You are a clear technical writer. You always return strict JSON matching the ' +
      'requested schema and never add commentary.',
    user: buildWalkthroughPrompt(painPoint, websiteName, refinement),
    temperature: 0.3,
    maxTokens: 900,
    timeoutMs: 30000,
  });
  const walkthrough = normalizeWalkthrough(out, painPoint);
  putCache(db, painPoint.id, 'walkthrough', hash, walkthrough);
  return walkthrough;
}

// ── Developer handoff prompt ──────────────────────────────────────────────
// Produces a paste-ready prompt an engineer can drop into Copilot / Claude /
// Cursor to actually implement the fix in their codebase. We ask the model for a
// single self-contained instruction block (not JSON-of-fields) so it reads like a
// well-written ticket, then return it as { prompt }.
function buildDevPromptPrompt(pp, websiteName, url) {
  return (
    `Write a high-quality prompt that a software engineer can paste directly into ` +
    `an AI coding assistant (GitHub Copilot, Claude, or Cursor) to IMPLEMENT the ` +
    `fix for the product pain point below in their real codebase.\n\n` +
    `PRODUCT: ${websiteName || 'the product'}${url ? ` (${url})` : ''}\n` +
    `PAIN POINT:\n` +
    `- Title: ${pp.title || ''}\n` +
    `- Summary: ${pp.summary || ''}\n` +
    `- Root cause: ${pp.rootCause || ''}\n\n` +
    `The prompt you write must:\n` +
    `- Open with a one-line task statement, then give clear context.\n` +
    `- Describe the concrete UI/UX or code change to make and the acceptance ` +
    `criteria (what "done" looks like).\n` +
    `- Ask the assistant to locate the relevant component(s), make the change, keep ` +
    `the existing design system/conventions, and add or update tests.\n` +
    `- Mention accessibility and responsive behavior where relevant.\n` +
    `- Be framework-agnostic (the engineer's stack is unknown) but practical.\n` +
    `- Be addressed TO the coding assistant (imperative second person), NOT a ` +
    `description of this task.\n\n` +
    `Return ONLY a JSON object: { "prompt": "<the full ready-to-paste prompt as a ` +
    `single string, using \\n for line breaks>" }. No commentary.`
  );
}

export async function generateDevPrompt(db, { painPoint, websiteName, url, refinement }) {
  const hash = painPointHash(painPoint);
  if (!refinement) {
    const cached = getCached(db, painPoint.id, 'dev-prompt', hash);
    if (cached) return cached;
  }

  const out = await chatJSON({
    system:
      'You are a senior engineer who writes precise, actionable prompts for AI ' +
      'coding assistants. You always return strict JSON matching the requested ' +
      'schema and never add commentary.',
    user:
      buildDevPromptPrompt(painPoint, websiteName, url) +
      (refinement ? `\n\n${refineBlock(refinement)}` : ''),
    temperature: 0.3,
    maxTokens: 1200,
    timeoutMs: 30000,
  });
  const fallback =
    `Implement a fix for the following product issue.\n\n` +
    `Issue: ${painPoint.title || ''}\n` +
    `Details: ${painPoint.summary || ''}\n` +
    `Root cause: ${painPoint.rootCause || ''}\n\n` +
    `Find the relevant component(s), make the change following the existing design ` +
    `system, ensure it is accessible and responsive, and add/update tests.`;
  const result = { prompt: str(out?.prompt, fallback) };
  putCache(db, painPoint.id, 'dev-prompt', hash, result);
  return result;
}
