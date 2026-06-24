// ──────────────────────────────────────────────────────────────
// Lightweight, dependency-free feedback clustering.
//
// Turns raw feedback rows (from the database) into pain points by matching
// each entry to a topic via keyword hits in its text + category. When a topic
// maps to a curated pain point for the same website, we reuse that pain point's
// rich title / summary / root cause / solutions so the bespoke wireframes and
// walkthroughs keep working. Otherwise an "emergent" pain point is generated.
// ──────────────────────────────────────────────────────────────

// Topics ordered by specificity. `curated` references a curated pain point id
// in mockData; it is only reused when that pain point belongs to the website.
const TOPICS = [
  { key: 'settings-discovery', label: 'finding settings & preferences', curated: 'pp-001',
    keywords: ['setting', 'settings', 'gear', 'preference', 'preferences', 'configure', 'profile picture', 'notification preference'] },
  { key: 'search', label: 'search quality', curated: 'pp-002',
    keywords: ['search', 'results', 'relevant', 'irrelevant', 'query', 'keyword', 'indexing'] },
  { key: 'meeting-controls', label: 'in-call meeting controls', curated: 'pp-101',
    keywords: ['mute', 'unmute', 'leave', 'call', 'meeting', 'controls', 'toolbar', 'mic', 'microphone', 'camera', 'hang up'] },
  { key: 'screen-share', label: 'screen sharing', curated: 'pp-102',
    keywords: ['screen share', 'screen-share', 'share my screen', 'present', 'presenting', 'share button'] },
  { key: 'schedule-send', label: 'scheduling / delayed send', curated: 'pp-201',
    keywords: ['schedule send', 'schedule', 'delay', 'send later', 'delayed', 'send at', 'deliver later'] },
  { key: 'attachments', label: 'attachments & previews', curated: 'pp-202',
    keywords: ['attachment', 'attachments', 'download', 'preview', 'inline'] },
  { key: 'notifications', label: 'notifications', curated: null,
    keywords: ['notification', 'notifications', 'badge', 'unread', 'alert', 'ping'] },
  { key: 'performance', label: 'performance & speed', curated: null,
    keywords: ['slow', 'lag', 'laggy', 'freeze', 'crash', 'loading', 'spinner', 'timeout'] },
  { key: 'navigation', label: 'navigation & discoverability', curated: null,
    keywords: ['find', 'cant find', "can't find", 'hidden', 'buried', 'menu', 'navigate', 'where is', 'invisible', 'discover'] },
];

const FALLBACK_TOPIC = { key: 'other', label: 'general usability', curated: null, keywords: [] };

function scoreTopic(haystack, topic) {
  let score = 0;
  for (const kw of topic.keywords) {
    if (haystack.includes(kw)) score += 1;
  }
  return score;
}

function pickTopic(entry) {
  const haystack = `${entry.text || ''} ${entry.category || ''}`.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const s = scoreTopic(haystack, topic);
    if (s > bestScore) {
      bestScore = s;
      best = topic;
    }
  }
  return best || FALLBACK_TOPIC;
}

function severityFor(impactScore) {
  if (impactScore >= 75) return 'critical';
  if (impactScore >= 50) return 'high';
  if (impactScore >= 30) return 'medium';
  return 'low';
}

function truncate(str, n = 140) {
  if (!str) return '';
  return str.length > n ? `${str.slice(0, n - 1).trim()}…` : str;
}

/**
 * @param {Array} feedback  feedback rows for a single website
 * @param {string} websiteId
 * @param {Array} curatedPainPoints  curated pain points (mockData.painPoints)
 * @returns {Array} derived pain points, sorted by impactScore desc
 */
export function clusterFeedback(feedback, websiteId, curatedPainPoints = []) {
  const curatedById = new Map(curatedPainPoints.map((p) => [p.id, p]));

  // Group feedback by chosen topic.
  const groups = new Map();
  for (const entry of feedback) {
    const topic = pickTopic(entry);
    if (!groups.has(topic.key)) groups.set(topic.key, { topic, items: [] });
    groups.get(topic.key).items.push(entry);
  }

  const painPoints = [];
  for (const { topic, items } of groups.values()) {
    const count = items.length;
    const avgRating = items.reduce((s, f) => s + (f.rating ?? 3), 0) / count;
    const impactScore = Math.max(
      0,
      Math.min(99, Math.round(count * 14 + (5 - avgRating) * 12))
    );
    const departments = [...new Set(items.map((f) => f.department).filter(Boolean))];
    const relatedFeedback = items.map((f) => f.id);

    // Reuse curated content only when it belongs to this website.
    const curated =
      topic.curated && curatedById.get(topic.curated)?.websiteId === websiteId
        ? curatedById.get(topic.curated)
        : null;

    if (curated) {
      painPoints.push({
        id: curated.id,
        websiteId,
        title: curated.title,
        severity: severityFor(impactScore),
        mentionCount: count,
        impactScore,
        departments: departments.length ? departments : curated.departments,
        summary: curated.summary,
        rootCause: curated.rootCause,
        relatedFeedback,
        solutions: curated.solutions || [],
        derived: false,
      });
    } else {
      const sample = items
        .slice()
        .sort((a, b) => (a.rating ?? 3) - (b.rating ?? 3))[0];
      const titleLabel = topic.label.replace(/(^\w)/, (m) => m.toUpperCase());
      painPoints.push({
        id: `pp-auto-${websiteId}-${topic.key}`,
        websiteId,
        title: `${titleLabel} (${count} report${count === 1 ? '' : 's'})`,
        severity: severityFor(impactScore),
        mentionCount: count,
        impactScore,
        departments,
        summary: `${count} ${count === 1 ? 'person' : 'people'} reported issues related to ${topic.label}. Representative feedback: “${truncate(sample?.text)}”`,
        rootCause: 'Auto-clustered from user feedback. Generate a solution to explore a fix, or review the related submissions for detail.',
        relatedFeedback,
        solutions: [],
        derived: true,
      });
    }
  }

  return painPoints.sort((a, b) => b.impactScore - a.impactScore);
}
