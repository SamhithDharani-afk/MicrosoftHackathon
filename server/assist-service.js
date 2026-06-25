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
  `You are an assistant that coaches employees to write clearer product feedback ` +
  `so an AI can turn it into UI wireframes. You receive a draft and its category, ` +
  `and you judge how actionable it is.\n\n` +
  `Strong feedback names a specific UI element (button/page/screen/menu), the ` +
  `action the user was taking, and the concrete outcome/problem. Time impact and ` +
  `screenshots make it stronger.\n\n` +
  `Return ONLY a JSON object of this exact shape:\n` +
  `{\n` +
  `  "score": <integer 0-100, how actionable the draft is>,\n` +
  `  "nudges": [ { "type": "success|warning|tip|nudge", "message": "<one short, ` +
  `specific sentence>" } ],\n` +
  `  "suggestions": [ "<short phrase the user could append to improve the draft>" ]\n` +
  `}\n\n` +
  `Rules: 0-3 nudges, most useful first. Use "success" only to affirm something ` +
  `done well, "warning" for a serious gap, "tip"/"nudge" otherwise. 0-4 ` +
  `suggestions, each a brief sentence starter or phrase (e.g. "I was trying to…", ` +
  `"It took me about __ minutes"), not a full rewrite. Messages may use **bold** / ` +
  `*italic*. Be concise and never invent details the user did not provide.`;

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
    maxTokens: 500,
    timeoutMs: 6000,
    signal,
  });

  return {
    score: clampScore(out?.score),
    nudges: normalizeNudges(out?.nudges),
    suggestions: normalizeSuggestions(out?.suggestions),
  };
}
