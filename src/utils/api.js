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
