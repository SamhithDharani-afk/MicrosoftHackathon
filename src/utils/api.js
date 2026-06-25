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

// Fetch AI-coalesced pain points. The server returns
// { analyzing, error, painPoints }; older/array responses are normalized too.
// Returns the same object shape so callers can show an "Analyzing…" or error UI.
export async function fetchPainPoints(websiteId) {
  const url = websiteId
    ? `/api/pain-points?websiteId=${encodeURIComponent(websiteId)}`
    : '/api/pain-points';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load pain points (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data)) return { analyzing: false, error: null, painPoints: data };
  return {
    analyzing: !!data.analyzing,
    error: data.error || null,
    painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],
  };
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

// Real-time feedback assistant: ask the backend (which calls a low-latency model)
// to score the draft and return nudges + quick-insert suggestions. Pass an
// AbortSignal so the caller can cancel in-flight requests while the user types.
// Resolves to { ok:false } on any failure so callers fall back to heuristics.
export async function assistFeedback(payload, signal) {
  try {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    if (!res.ok) return { ok: false };
    return res.json();
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return { ok: false };
  }
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
// fix to the cached "before" and returns both documents. Pass `refinement` to
// correct a wrong result and regenerate (e.g. "put the gear top-right").
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

// Fetch a live screenshot of the page (base64 data URL), cached server-side.
// Powers the Before panel's "Live page" toggle.
export async function fetchScreenshot(websiteId, url) {
  const params = new URLSearchParams({ websiteId });
  if (url) params.set('url', url);
  const res = await fetch(`/api/wireframe/screenshot?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.image) {
    throw new Error(data?.error || `Failed to capture the live page (${res.status})`);
  }
  return data; // { image, url }
}

// Generate a paste-ready prompt an engineer can drop into Copilot / Claude /
// Cursor to implement the fix. Pass `refinement` to regenerate with a correction.
// Used by DevPromptButton (takes a full painPoint object).
export async function generateDevPrompt(painPoint, websiteName, url, refinement) {
  const res = await fetch('/api/dev-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ painPoint, websiteName, url, refinement }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.prompt) {
    throw new Error(data?.error || `Failed to generate dev prompt (${res.status})`);
  }
  return data.prompt;
}

// Ask the backend (isolated Copilot CLI) to refine a developer-ready prompt for
// the proposed wireframe/flow change. Used by AIPromptPanel (takes a flat context
// object with kind, websiteName, url, painPointSummary, fixTitle, fixDescription).
export async function generateWireframeDevPrompt(payload) {
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

// Generate a simulated-usage GIF for the proposed change: the server applies the
// fix, then renders a fake cursor finding and "using" each change frame by frame,
// returning an animated GIF as a data URL that embeds as a plain <img>.
export async function generateWalkthroughVideo(payload) {
  const res = await fetch('/api/walkthrough-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.gif) {
    throw new Error(data?.error || `Failed to generate simulation (${res.status})`);
  }
  return data; // { gif, changeCount, after }
}

// Generate a before/after process-flow diagram for a pain point. The server
// returns a structured flow ({ title, description, start, oldSteps, … }) which
// the client lays out with buildProcessFlow(). Pass `refinement` to regenerate.
export async function generateProcessFlow(painPoint, websiteName, refinement) {
  const res = await fetch('/api/process-flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ painPoint, websiteName, refinement }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.flow) {
    throw new Error(data?.error || `Failed to generate process flow (${res.status})`);
  }
  return data.flow;
}

// Generate a step-by-step text walkthrough of the proposed fix for a pain point.
// Pass `refinement` to regenerate with a correction note.
export async function generateWalkthrough(painPoint, websiteName, refinement) {
  const res = await fetch('/api/walkthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ painPoint, websiteName, refinement }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.walkthrough) {
    throw new Error(data?.error || `Failed to generate walkthrough (${res.status})`);
  }
  return data.walkthrough;
}

// Generate a Playwright-screenshot slideshow walkthrough for the proposed change:
// the server applies the fix, captures the redesigned wireframe as slides, and
// returns an ordered set of captioned PNG slides. Used by WalkthroughSlideshow.
export async function generateSlideshowWalkthrough(payload) {
  const res = await fetch('/api/walkthrough/slideshow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error(data?.error || `Failed to generate walkthrough (${res.status})`);
  }
  return data; // { slides, after }
}
