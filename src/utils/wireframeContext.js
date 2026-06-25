import { painPoints, websites, wireframes } from '../data/mockData.js';

// Resolve everything the wireframe viewer needs from a solution id (the route
// param of /wireframe/:id): the originating website + live URL, the user pain
// point, and the fix title/description that drives the "after" generation.
//
// Dashboards are keyed by website now, so the solution -> pain point -> website
// chain gives us the URL — there is no need to ask the user to paste one.
export function resolveWireframeContext(solutionId) {
  for (const pp of painPoints) {
    const sol = pp.solutions?.find((s) => s.id === solutionId);
    if (!sol) continue;
    const site = websites.find((w) => w.id === pp.websiteId) || null;
    const wf = wireframes[solutionId] || null;
    return {
      websiteId: pp.websiteId,
      url: site?.url || '',
      websiteName: site?.name || '',
      painPointSummary: pp.summary || '',
      title: wf?.title || sol.title || 'Proposed Design Change',
      description: wf?.description || sol.description || '',
    };
  }
  return null;
}

// Build the same context shape directly from a pain point + its website, for
// AI-clustered pain points that have no curated solution id. Lets the wireframe
// viewer work for ANY pain point on ANY website (the server generates the
// before/after from the live URL + this fix description).
export function buildPainPointWireframeContext(painPoint, website) {
  if (!painPoint) return null;
  return {
    websiteId: painPoint.websiteId,
    url: website?.url || '',
    websiteName: website?.name || '',
    painPointSummary: painPoint.summary || '',
    title: `Proposed fix: ${painPoint.title || 'design change'}`,
    description:
      painPoint.rootCause ||
      painPoint.summary ||
      'Propose and apply a concrete UI fix for this pain point.',
  };
}
