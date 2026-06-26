// Feedback Assistant — real-time coaching for the feedback textarea.
//
// Scores the draft and returns nudges + quick-insert suggestions as the user
// types. Runs live (debounced ~400ms with in-flight cancellation), so it must be
// fast. When a GitHub Models token is configured we use the model (gpt-4o-mini)
// for richer coaching; otherwise — or on any model failure — we fall back to an
// instant, token-free heuristic grader (`localAssist`) so the assistant ALWAYS
// works, with no token required. The Copilot CLI is intentionally NOT used here:
// it is ~seconds per call and serialized, which would make type-ahead unusable.

import { chatJSON, hasToken } from './github-models.js';

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

// ── Token-free heuristic grader ───────────────────────────────────────────
// Mirrors the model's rubric deterministically so the assistant works instantly
// without any token: strong feedback names a specific UI element, the action the
// user was taking, and the concrete problem/outcome; time impact and screenshots
// make it stronger. Deterministic output means the score never flip-flops.
const UI_TERMS = [
  'button', 'icon', 'gear', 'menu', 'page', 'screen', 'tab', 'link', 'dialog',
  'field', 'dropdown', 'drop-down', 'toolbar', 'setting', 'settings', 'search',
  'form', 'panel', 'sidebar', 'notification', 'popup', 'pop-up', 'modal',
  'checkbox', 'toggle', 'avatar', 'profile', 'header', 'banner', 'tooltip',
];
const PROBLEM_TERMS = [
  "can't", 'cannot', 'can not', "couldn't", "couldnt", "won't", 'wont',
  "doesn't", 'doesnt', "didn't", 'didnt', 'not working', 'no longer', 'error',
  'fails', 'failed', 'broken', 'missing', 'hard to', 'difficult', 'confusing',
  'unclear', 'slow', 'laggy', 'crash', 'freeze', 'stuck', 'lost', 'frustrat',
  'annoying', 'hidden', 'buried', 'nowhere', 'unable', "isn't", 'useless',
];
const ACTION_RE =
  /\b(i was|i am|i tried|i want|i wanted|i need|trying to|when i|i clicked|i tapped|i looked|looking for|i searched|i opened|i selected|i pressed|to find|to change|to update|to access|to enable|to disable|to turn)\b/;
const TIME_RE = /\b\d+\s*(min|mins|minute|minutes|hour|hours|sec|secs|second|seconds)\b/;
const TIME_TERMS = ['wasted', 'too long', 'forever', 'ages', 'took me'];

const includesAny = (haystack, terms) => terms.some((t) => haystack.includes(t));

export function localAssist({ text, hasImages }) {
  const raw = String(text || '');
  const lc = raw.toLowerCase();
  const words = raw.trim().split(/\s+/).filter(Boolean);
  const wc = words.length;

  if (wc === 0) return { score: 0, nudges: [], suggestions: [] };

  const hasUi = includesAny(lc, UI_TERMS);
  const hasAction = ACTION_RE.test(lc);
  const hasProblem = includesAny(lc, PROBLEM_TERMS);
  const hasTime = TIME_RE.test(lc) || includesAny(lc, TIME_TERMS);

  let score = Math.min(45, 12 + wc * 2.2); // length contribution, capped
  if (hasUi) score += 16;
  if (hasAction) score += 14;
  if (hasProblem) score += 14;
  if (hasTime) score += 8;
  if (hasImages) score += 8;
  score = clampScore(score);
  if (wc >= 4 && score < 35) score = 35; // any genuine on-topic comment is useful

  // Lead with a "success" nudge affirming what's already there.
  const rawNudges = [];
  if (hasUi) rawNudges.push({ type: 'success', message: 'Nice — you named a specific part of the UI.' });
  else if (hasProblem) rawNudges.push({ type: 'success', message: 'Good — you described what went wrong.' });
  else if (wc >= 8) rawNudges.push({ type: 'success', message: "Thanks — that's a real, on-topic comment." });
  else rawNudges.push({ type: 'success', message: 'Thanks for the feedback!' });

  // Add at most one tip for the single biggest gap.
  if (!hasUi) rawNudges.push({ type: 'tip', message: 'Name the specific **button, page, or menu** involved.' });
  else if (!hasAction) rawNudges.push({ type: 'tip', message: 'Add what you were **trying to do** when it happened.' });
  else if (!hasProblem) rawNudges.push({ type: 'tip', message: 'Describe the **outcome or problem** you hit.' });
  else if (!hasTime && !hasImages) rawNudges.push({ type: 'tip', message: 'Optional: add **time lost** or a **screenshot**.' });

  // Quick-insert sentence starters for whatever is still missing.
  const rawSuggestions = [];
  if (!hasAction) rawSuggestions.push('I was trying to…');
  if (!hasUi) rawSuggestions.push('The … button / page / menu');
  if (!hasProblem) rawSuggestions.push('What went wrong was…');
  if (!hasTime) rawSuggestions.push('It took me about __ minutes');

  return {
    score,
    nudges: normalizeNudges(rawNudges),
    suggestions: normalizeSuggestions(rawSuggestions),
  };
}

// Analyze a feedback draft. Returns { score, nudges, suggestions }. Uses the
// model when a token is available; otherwise (or on any model failure) returns
// the instant token-free heuristic so the assistant always works.
export async function assistFeedback({ text, category, hasImages }, signal) {
  if (!hasToken()) return localAssist({ text, hasImages });

  const user =
    `Category: ${category || 'general'}\n` +
    `Has screenshot attached: ${hasImages ? 'yes' : 'no'}\n` +
    `Draft feedback:\n"""\n${String(text || '').slice(0, 2000)}\n"""`;

  let out;
  try {
    out = await chatJSON({
      system: SYSTEM_PROMPT,
      user,
      temperature: 0.2,
      maxTokens: 500,
      timeoutMs: 6000,
      signal,
    });
  } catch (err) {
    // Propagate client cancellations; otherwise degrade to the heuristic.
    if (err?.name === 'AbortError') throw err;
    return localAssist({ text, hasImages });
  }

  return {
    score: clampScore(out?.score),
    nudges: normalizeNudges(out?.nudges),
    suggestions: normalizeSuggestions(out?.suggestions),
  };
}
