// Feedback Assistant — real-time coaching for the feedback textarea.
//
// Replaces the regex/keyword heuristics in FeedbackForm.jsx with a real model
// call (GitHub Models gpt-4o-mini) that scores the draft and returns nudges +
// quick-insert suggestions. Runs live as the user types, so it is intentionally
// low-latency: a short prompt, a tight token budget and a hard timeout. On any
// failure the route returns { ok:false } and the client keeps its instant
// heuristic output, so the assistant degrades gracefully.

import { chatJSON } from './github-models.js';

const NUDGE_TYPES = new Set(['success', 'warning', 'tip', 'nudge']);

const SYSTEM_PROMPT =
  `You are a friendly, encouraging assistant that helps people write useful ` +
  `product feedback an AI can turn into UI improvements. You get a draft and its ` +
  `category and gently coach the writer.\n\n` +
  `Be generous. ANY genuine, on-topic comment about the product is useful feedback ` +
  `— never demand a specific format or scold the writer. Naming a UI element ` +
  `(button/page/menu), what they were doing, or the problem makes feedback ` +
  `stronger, but missing some of that is totally fine.\n\n` +
  `Score leniently, leaning high when in doubt:\n` +
  `- 80-100: clear, on-topic feedback that points at something specific.\n` +
  `- 60-79: a real comment about the product, even if brief or missing specifics.\n` +
  `- 35-59: very short or vague, but on-topic.\n` +
  `- 0-34: empty, gibberish, or unrelated.\n\n` +
  `Return ONLY a JSON object of this exact shape:\n` +
  `{\n` +
  `  "score": <integer 0-100>,\n` +
  `  "nudges": [ { "type": "success|tip", "message": "<one short sentence>" } ],\n` +
  `  "suggestions": [ "<short phrase the user could optionally add>" ]\n` +
  `}\n\n` +
  `Rules: 0-2 nudges. Lead with a "success" nudge affirming what already works; add ` +
  `at most ONE "tip" with a single concrete, optional improvement, and only when it ` +
  `genuinely helps. Never list multiple gaps or use a scolding tone. 0-3 ` +
  `suggestions, each a brief sentence starter or phrase (e.g. "I was trying to…", ` +
  `"It took me about __ minutes"), not a full rewrite. Keep every message under ~12 ` +
  `words. Messages may use **bold**/*italic*. Never invent details the user did not ` +
  `provide.`;

function clampScore(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function normalizeNudges(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((n, i) => {
      const type = NUDGE_TYPES.has(n?.type) ? n.type : 'tip';
      const message = typeof n?.message === 'string' ? n.message.trim() : '';
      return message ? { id: `ai-${i}`, type, message } : null;
    })
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeSuggestions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .slice(0, 4);
}

// Analyze a feedback draft. Returns { score, nudges, suggestions } or throws so
// the caller can fall back to heuristics.
export async function assistFeedback({ text, category, hasImages }, signal) {
  const user =
    `Category: ${category || 'general'}\n` +
    `Has screenshot attached: ${hasImages ? 'yes' : 'no'}\n` +
    `Draft feedback:\n"""\n${String(text || '').slice(0, 2000)}\n"""`;

  const out = await chatJSON({
    system: SYSTEM_PROMPT,
    user,
    temperature: 0.2,
    maxTokens: 350,
    timeoutMs: 6000,
    signal,
  });

  return {
    score: clampScore(out?.score),
    nudges: normalizeNudges(out?.nudges),
    suggestions: normalizeSuggestions(out?.suggestions),
  };
}
