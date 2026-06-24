// Frontend API client. Requests are same-origin and proxied to the API
// server by Vite (see `server.proxy` in vite.config.js).
const BASE = '/api';

export async function getFeedback() {
  const res = await fetch(`${BASE}/feedback`);
  if (!res.ok) throw new Error('Failed to load feedback.');
  return res.json();
}

export async function submitFeedback(form, file) {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => data.append(key, value));
  if (file) data.append('screenshot', file);

  const res = await fetch(`${BASE}/feedback`, { method: 'POST', body: data });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to submit feedback.');
  }
  return res.json();
}

export async function getPainPoints() {
  const res = await fetch(`${BASE}/painpoints`);
  if (!res.ok) throw new Error('Failed to load pain points.');
  return res.json();
}
