// Build a copy-paste-ready prompt that a developer can drop into an external AI
// coding assistant (GitHub Copilot, ChatGPT, etc.) to implement the proposed change.
// This is the instant, offline template; the backend can optionally refine it with
// Copilot via /api/dev-prompt.
export function buildDevPrompt(ctx = {}) {
  const {
    kind = 'wireframe',
    websiteName = '',
    url = '',
    painPointSummary = '',
    title = '',
    description = '',
  } = ctx;

  const product = websiteName || 'the web application';
  const kindGuidance =
    kind === 'process-flow'
      ? 'Re-implement the user flow so it matches the improved path described below ' +
        '(fewer steps/clicks). Update the relevant navigation, routing, and any ' +
        'intermediate screens so the journey is as short and clear as the proposed flow.'
      : 'Add or modify the relevant UI element(s) exactly as described below. A ' +
        'wireframe of the proposed design is available for reference, so match its ' +
        'placement and intent.';

  return [
    `You are an expert front-end engineer. Help me implement a UI/UX improvement for ${product}.`,
    '',
    'CONTEXT',
    `- Product / page: ${product}${url ? ` (${url})` : ''}`,
    `- User pain point: ${painPointSummary || 'N/A'}`,
    `- Proposed change: ${title || 'N/A'}`,
    `- Details: ${description || 'N/A'}`,
    '',
    'TASK',
    kindGuidance,
    '',
    'REQUIREMENTS',
    '- Keep the existing design language, spacing, color palette, and components consistent.',
    '- Make the new/changed element clearly discoverable and accessible: keyboard',
    '  operable, screen-reader labels, sufficient contrast, and visible focus states.',
    '- Do not regress existing functionality or layout.',
    '- Follow the repository\'s conventions and reuse existing components/utilities where possible.',
    '',
    'DELIVERABLES',
    '- The concrete code changes (with file paths) needed to implement this.',
    '- A short explanation of where the change goes and why.',
    '- Any new props, routes, state, or assets you introduce.',
    '',
    'Please produce production-ready code I can copy directly into the project.',
  ].join('\n');
}
