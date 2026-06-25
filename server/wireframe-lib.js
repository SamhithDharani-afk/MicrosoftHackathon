// Pure, side-effect-free helpers for the FeedbackFlow wireframe feature.
//
// These are split out from index.js (which has process-level side effects:
// resolving the copilot binary, spawning the CLI, screenshotting with a headless
// browser) so they can be reasoned about and unit-tested in isolation.

// Isolation contract: decide whether a top-level entry from the real ~/.copilot
// home should be copied into the ephemeral COPILOT_HOME used for scripted calls.
// Session data must NEVER be carried over — that is what would clog the user's
// `copilot --resume` list / sync to the web app, or collide with a concurrently
// running Copilot instance. Auth + config (everything else) is safe to copy.
const HOME_EXCLUDE = new Set(['session-state', 'logs']);
export function shouldCopyHomeEntry(name) {
  if (HOME_EXCLUDE.has(name)) return false;
  if (name.startsWith('session-store.db')) return false;
  return true;
}

// Prompt for the BEFORE wireframe (vision path): the model is given a PNG of the
// live page as an attachment and must reproduce it as a single faithful HTML
// document. This is the expensive call we pre-generate and cache per URL.
export function buildBeforePrompt() {
  return (
    `You are given a screenshot of a live web page. ` +
    `Reproduce it as ONE self-contained HTML5 document.\n\n` +
    `RULES (follow exactly):\n` +
    `- Output ONE complete HTML5 file with inline <style> only. ` +
    `No external/network requests, no <img>, no SVG, no scripts, no libraries.\n` +
    `- Match the screenshot as closely as you can: same overall layout, color ` +
    `palette, text, fonts, spacing and proportions, targeting a 1280x900 viewport.\n` +
    `- Use the real text visible in the screenshot; for anything illegible use a ` +
    `brief realistic placeholder.\n` +
    `- ZERO commentary or meta-text. Do NOT add captions, legends, callouts, ` +
    `badges, notes, or any title that describes your work. The page must look like ` +
    `the real website, not an explanation.\n\n` +
    `Output ONLY the raw HTML document. ` +
    `No explanation, no markdown fences, no commentary before or after it.`
  );
}

// Prompt for the AFTER wireframe (text path): the model is given the already
// generated BEFORE HTML and applies ONLY the proposed fix, returning the full
// modified document. This is the fast call we run on-the-fly when the user clicks
// Generate, so the AFTER differs from the BEFORE only by the requested change.
export function buildAfterPrompt({ beforeHtml, painPointSummary, fixTitle, fixDescription }) {
  return (
    `Here is the complete HTML of a web page:\n"""\n${String(beforeHtml || '')}\n"""\n\n` +
    `User feedback / pain point: '${painPointSummary || 'N/A'}'.\n` +
    `Apply ONLY this change to the page: '${fixTitle} — ${fixDescription}'.\n\n` +
    `CRITICAL — TAG EVERY CHANGE (do this every time):\n` +
    `On EACH HTML element you add or modify to implement the fix, add the attribute ` +
    `data-ff-new="true". Tag the actual leaf control (e.g. the button or icon), NOT a ` +
    `surrounding container, row, or wrapper. If the fix has multiple parts, tag the ` +
    `one leaf element for each part (so there may be several tagged elements); if it ` +
    `is a single change, tag exactly one. Do not tag unrelated, unchanged elements. ` +
    `Example: <button data-ff-new="true" class="...">+ New post</button>. This ` +
    `attribute renders nothing visible by itself — it is a hook used later to ` +
    `highlight the change — so it does NOT count as a visible label. Omitting it is a ` +
    `failure.\n\n` +
    `RULES (follow exactly):\n` +
    `- Keep everything else byte-for-byte identical so the fix is the only visible ` +
    `difference. Same layout, palette, text, fonts and proportions otherwise.\n` +
    `- Stay self-contained: inline <style> only, no external/network requests, no ` +
    `<img>, no SVG, no scripts, no libraries.\n` +
    `- ZERO VISIBLE commentary or meta-text. Do NOT draw any captions, legends, ` +
    `callouts, badges, visible "NEW"/"Added"/"Changed"/"Before"/"After" text, arrows, ` +
    `or notes on the page. The page must look like the real website with the fix in ` +
    `place. (The invisible data-ff-new attribute above is still required.)\n\n` +
    `Output ONLY the full modified HTML document. ` +
    `No explanation, no markdown fences, no commentary before or after it.`
  );
}

// Prompt that asks the model to write a developer-ready prompt for an EXTERNAL AI
// coding assistant. The output is the prompt text itself (ready to copy/paste),
// tailored to the specific change.
export function buildDevPromptRequest({ kind, websiteName, url, painPointSummary, fixTitle, fixDescription }) {
  const kindLabel = kind === 'process-flow' ? 'user-flow / process redesign' : 'UI wireframe change';
  return (
    `Write a single, detailed, copy-paste-ready prompt that a developer will paste ` +
    `into an external AI coding assistant (such as GitHub Copilot or ChatGPT) to ` +
    `implement the following ${kindLabel} in their own front-end codebase.\n\n` +
    `Product / page: ${websiteName || 'a web application'}${url ? ` (${url})` : ''}\n` +
    `User pain point: ${painPointSummary || 'N/A'}\n` +
    `Proposed change: ${fixTitle || 'N/A'}\n` +
    `Details: ${fixDescription || 'N/A'}\n\n` +
    `The prompt you write MUST:\n` +
    `- Be addressed to the coding assistant (second person), not to me.\n` +
    `- Open with concise context, then explicit requirements (keep the existing ` +
    `design language; accessibility — keyboard, ARIA labels, contrast, focus; no ` +
    `regressions; follow repo conventions and reuse existing components).\n` +
    `- State the deliverables: concrete code changes with file paths, a short ` +
    `explanation of where the change goes, and any new props/routes/state.\n` +
    `- Be specific to THIS change, well-structured, and usable verbatim.\n\n` +
    `Output ONLY the prompt text. No preamble, no surrounding quotes, no markdown ` +
    `code fences, and nothing addressed to me.`
  );
}

// JSON object per line; the answer is the last assistant message's text content,
// which may live under several shapes depending on event type.
export function extractAnswer(stdout) {
  const candidates = [];
  for (const line of String(stdout).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed[0] !== '{') continue;
    let obj;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      continue;
    }
    const content =
      obj?.message?.data?.content ??
      obj?.message?.content ??
      obj?.data?.content ??
      (typeof obj?.content === 'string' ? obj.content : undefined);
    const text = Array.isArray(content)
      ? content.map((c) => (typeof c === 'string' ? c : c?.text ?? '')).join('')
      : content;
    if (typeof text === 'string' && text.trim()) candidates.push(text);
  }
  return candidates.length ? candidates[candidates.length - 1] : '';
}

// Strip ```html ... ``` (or bare ```) fences and isolate the HTML document.
export function cleanHtml(raw) {
  let html = String(raw).trim();
  const fence = html.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) html = fence[1].trim();
  const start = html.search(/<!doctype html|<html[\s>]/i);
  if (start > 0) html = html.slice(start);
  return html.trim();
}
