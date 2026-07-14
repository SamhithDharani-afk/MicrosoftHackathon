// On-demand AI generation of "solution" artifacts for a pain point:
//   - process-flow : a before/after user-journey diagram (structured, the client
//                     lays it out with ReactFlow)
//   - walkthrough   : a step-by-step guide to the proposed fix
//   - dev-prompt    : a paste-ready prompt for an AI coding assistant
//
// These are latency-tolerant (the user explicitly clicks "Generate"), so they run
// through the SAME isolated Copilot CLI (Copilot Pro, no GitHub token needed) that
// powers the wireframes — `runCopilotJSON` — rather than the token-gated GitHub
// Models API. This makes every artifact genuinely contextual to the specific pain
// point + the real user feedback behind it. Results are cached in SQLite keyed by
// the pain point id + a hash of its text, so a given pain point generates once and
// stays stable until its underlying feedback (and therefore its text) changes.

import { createHash } from 'node:crypto';
import { runCopilotJSON } from './wireframe-service.js';

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
// Render real user feedback verbatim so the model grounds every step in what
// users actually said (instead of emitting generic placeholder journeys).
function quotesBlock(quotes) {
  const list = (Array.isArray(quotes) ? quotes : [])
    .map((q) => str(q))
    .filter(Boolean)
    .slice(0, 6);
  if (!list.length) return '';
  return (
    `REAL USER FEEDBACK (verbatim — ground every step in what these users actually ` +
    `experienced):\n` +
    list.map((q) => `- "${q}"`).join('\n') +
    `\n\n`
  );
}

function buildFlowPrompt(pp, websiteName, refinement, quotes) {
  return (
    `You are designing a BEFORE/AFTER user-journey diagram that contrasts the ` +
    `current broken experience with a specific, concrete proposed fix for a product ` +
    `pain point on "${websiteName || 'the product'}".\n\n` +
    `PAIN POINT:\n` +
    `- Title: ${pp.title || ''}\n` +
    `- Summary: ${pp.summary || ''}\n` +
    `- Root cause: ${pp.rootCause || ''}\n` +
    (pp.severity ? `- Severity: ${pp.severity}\n` : '') +
    `\n` +
    quotesBlock(quotes) +
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
    `Rules: Make every step SPECIFIC to THIS product and pain point — name the actual ` +
    `UI elements, screens, clicks and emotions implied by the feedback above. NEVER ` +
    `use generic filler like "User hits the issue", "Gives up frustrated", "User ` +
    `finds the fix" or "Task done quickly". oldSteps and newSteps each have 3-4 short ` +
    `imperative steps (<=9 words each). The last oldStep conveys the specific ` +
    `frustration users described; the last newStep the specific quick success. The ` +
    `outcome should include a plausible concrete metric. Output JSON only.`
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

export async function generateProcessFlow(db, { painPoint, websiteName, refinement, quotes }) {
  const hash = painPointHash(painPoint);
  // A refinement is an explicit "this was wrong, try again" — always regenerate,
  // then overwrite the cache so the corrected version persists on later visits.
  if (!refinement) {
    const cached = getCached(db, painPoint.id, 'process-flow', hash);
    if (cached) return cached;
  }

  // Generate through the isolated Copilot CLI (no token). On any failure, fall
  // back to the deterministic builder so the feature still works — but do NOT
  // cache that generic fallback, so a later click can retry a real generation.
  let out = null;
  try {
    out = await runCopilotJSON(buildFlowPrompt(painPoint, websiteName, refinement, quotes));
  } catch {
    out = null;
  }
  const flow = normalizeFlow(out, painPoint);
  if (out) putCache(db, painPoint.id, 'process-flow', hash, flow);
  return flow;
}

// ── Walkthrough ───────────────────────────────────────────────────────────
function buildWalkthroughPrompt(pp, websiteName, refinement, quotes) {
  return (
    `You are writing a short, friendly step-by-step walkthrough that guides a user ` +
    `through the PROPOSED FIX for a product pain point on ` +
    `"${websiteName || 'the product'}".\n\n` +
    `PAIN POINT:\n` +
    `- Title: ${pp.title || ''}\n` +
    `- Summary: ${pp.summary || ''}\n` +
    `- Root cause: ${pp.rootCause || ''}\n\n` +
    quotesBlock(quotes) +
    refineBlock(refinement) +
    `Return ONLY a JSON object:\n` +
    `{ "title": "<walkthrough title>",\n` +
    `  "steps": [ { "title": "<step title>", "description": "<1-2 sentence ` +
    `instruction describing what the user sees/does with the new design>" } ] }\n\n` +
    `Rules: 3-5 steps. Describe the IMPROVED experience (the fix in action), not ` +
    `the old broken one. Reference the actual UI elements and tasks implied by the ` +
    `feedback above. Keep it concrete and specific to this pain point. Output ` +
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

export async function generateWalkthrough(db, { painPoint, websiteName, refinement, quotes }) {
  const hash = painPointHash(painPoint);
  if (!refinement) {
    const cached = getCached(db, painPoint.id, 'walkthrough', hash);
    if (cached) return cached;
  }

  let out = null;
  try {
    out = await runCopilotJSON(buildWalkthroughPrompt(painPoint, websiteName, refinement, quotes));
  } catch {
    out = null;
  }
  const walkthrough = normalizeWalkthrough(out, painPoint);
  if (out) putCache(db, painPoint.id, 'walkthrough', hash, walkthrough);
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

  // Always have a complete, ready-to-paste prompt built locally — no token,
  // API, or network required. This is what the user copies into the AI of
  // their choice to build the solution shown in the wireframe.
  const local = buildLocalDevPrompt(painPoint, websiteName, url, refinement);

  // Opportunistically enrich via Copilot when available, but never let its
  // absence or failure block the feature.
  let out = null;
  try {
    out = await runCopilotJSON(
      buildDevPromptPrompt(painPoint, websiteName, url) +
        (refinement ? `\n\n${refineBlock(refinement)}` : '')
    );
  } catch {
    out = null;
  }
  const result = { prompt: str(out?.prompt, local) };
  putCache(db, painPoint.id, 'dev-prompt', hash, result);
  return result;
}

// Build a complete, high-quality implementation prompt entirely offline from the
// pain point + its proposed solution(s). The output is addressed TO an AI coding
// assistant so the user can copy-paste it into Copilot, Claude, Cursor, ChatGPT,
// etc. to build the solution version they just previewed in the wireframe.
function buildLocalDevPrompt(pp, websiteName, url, refinement) {
  const product = websiteName || 'the product';
  const solutions = Array.isArray(pp?.solutions) ? pp.solutions : [];
  const wireframe =
    solutions.find((s) => s?.type === 'wireframe') || solutions[0] || null;
  const flow = solutions.find((s) => s?.type === 'process-flow') || null;

  const lines = [
    `You are an expert front-end engineer. Implement the UI/UX improvement described ` +
      `below for ${product}${url ? ` (${url})` : ''}, in whatever codebase I share with you.`,
    '',
    'CONTEXT',
    `- Product / page: ${product}${url ? ` (${url})` : ''}`,
    `- User pain point: ${pp?.title || 'N/A'}`,
    `- What users experience: ${pp?.summary || 'N/A'}`,
  ];
  if (pp?.rootCause) lines.push(`- Root cause: ${pp.rootCause}`);
  if (pp?.severity) lines.push(`- Severity: ${pp.severity}`);

  lines.push('', 'PROPOSED SOLUTION (from the wireframe preview)');
  if (wireframe) {
    lines.push(`- ${wireframe.title || 'Proposed change'}: ${wireframe.description || ''}`);
  } else {
    lines.push('- Resolve the pain point above with the smallest, clearest UI change.');
  }
  if (flow) {
    lines.push(`- Improved flow: ${flow.title || ''} — ${flow.description || ''}`);
  }

  lines.push(
    '',
    'TASK',
    'Recreate the "after" (solution) version shown in the wireframe. Add or modify the ' +
      'relevant UI element(s) exactly as described so the pain point is resolved, matching ' +
      'the placement and intent of the proposed design.',
    '',
    'REQUIREMENTS',
    '- Keep the existing design language, spacing, color palette, and components consistent.',
    '- Make the new/changed element clearly discoverable and accessible: keyboard operable,',
    '  screen-reader labels, sufficient color contrast, and visible focus states.',
    '- Do not regress existing functionality or layout; keep changes surgical.',
    '- Follow the repository conventions and reuse existing components/utilities where possible.',
    '',
    'DELIVERABLES',
    '- The concrete code changes (with file paths) needed to implement this.',
    '- A short explanation of where each change goes and why.',
    '- Any new props, routes, state, assets, or tests you introduce.',
  );
  if (refinement) {
    lines.push('', 'ADDITIONAL DIRECTION', `- ${refinement}`);
  }
  lines.push('', 'Produce production-ready code I can copy directly into the project.');

  return lines.join('\n');
}
