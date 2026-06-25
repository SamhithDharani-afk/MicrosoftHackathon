// Thin client for the feedback API (Express + SQLite backend).
// Vite proxies /api -> http://localhost:3001 during development.

export async function fetchFeedback(websiteId) {
  const url = websiteId
    ? `/api/feedback?websiteId=${encodeURIComponent(websiteId)}`
    : '/api/feedback';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load feedback (${res.status})`);
  return res.json();
}

export async function fetchPainPoints(websiteId) {
  const url = websiteId
    ? `/api/pain-points?websiteId=${encodeURIComponent(websiteId)}`
    : '/api/pain-points';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load pain points (${res.status})`);
  return res.json();
}

export async function submitFeedback(payload) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = `Failed to submit feedback (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json();
}

// Fetch the pre-generated "before" wireframe for a website. The server screenshots
// the live URL and reproduces it as HTML on first use, then caches it.
export async function fetchWireframe(websiteId, url) {
  const params = new URLSearchParams({ websiteId });
  if (url) params.set('url', url);
  const res = await fetch(`/api/wireframe?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Failed to load wireframe (${res.status})`);
  return data; // { before, url, ready }
}

// Generate the "after" wireframe on the fly: the server applies ONLY the proposed
// fix to the cached "before" and returns both documents.
export async function generateAfter(payload) {
  const res = await fetch('/api/wireframe/after', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (!data.before && !data.after)) {
    throw new Error(data?.error || `Failed to generate wireframe (${res.status})`);
  }
  return data; // { before, after }
}

// Ask the backend (isolated Copilot CLI) to refine a developer-ready prompt for the
// proposed change, tailored so it can be pasted into any external AI coding assistant.
export async function generateDevPrompt(payload) {
  const res = await fetch('/api/dev-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.prompt) {
    throw new Error(data?.error || `Failed to generate prompt (${res.status})`);
  }
  return data; // { prompt }
}
