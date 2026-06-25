// Shared client for the GitHub Models inference API (OpenAI-compatible).
//
// Used by the low-latency interactive paths that must NOT pay the Copilot CLI
// cold-start cost:
//   - assist-service.js   (live feedback coaching as the user types)
//   - coalesce-service.js (semantic pain-point clustering)
//
// The GitHub token is read from the server environment only, so it is never
// exposed to the browser. Calls return strict JSON (response_format json_object).

const ENDPOINT = 'https://models.github.ai/inference/chat/completions';

// Low-latency, non-reasoning model — sub-second warm, ideal for type-ahead.
// Override with GITHUB_MODELS_MODEL. The publisher prefix is required.
export const MODEL = process.env.GITHUB_MODELS_MODEL || 'openai/gpt-4o-mini';

// Read the token lazily so the server can boot without it (the features then
// fall back to their heuristics). Checked in priority order.
export function getToken() {
  return (
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_MODELS_TOKEN ||
    process.env.GH_TOKEN ||
    ''
  );
}

export function hasToken() {
  return !!getToken();
}

// Call the model and return the parsed JSON object from its single message.
// Throws when no token is configured, the request errors/times out, or the
// response is not valid JSON — callers catch this and fall back to heuristics.
export async function chatJSON({
  system,
  user,
  model = MODEL,
  temperature = 0.2,
  maxTokens = 600,
  timeoutMs = 3500,
  signal,
}) {
  const token = getToken();
  if (!token) throw new Error('no GitHub Models token configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Abort if the caller's own signal fires (e.g. client cancelled the request).
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`GitHub Models ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('GitHub Models returned empty content');
  }
  return JSON.parse(content);
}
