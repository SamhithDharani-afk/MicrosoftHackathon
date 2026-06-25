// ──────────────────────────────────────────────────────────────
// Websites (products) that managers track.
// Each website has its own feedback + AI-analyzed pain points, so the
// dashboard reconfigures itself depending on which website is selected.
// `repoConnected` is OPTIONAL extra context — a site works fully without it.
// ──────────────────────────────────────────────────────────────
export const websites = [
  {
    id: 'viva-engage',
    name: 'Viva Engage',
    shortName: 'Engage',
    url: 'https://www.microsoft.com/en-us/microsoft-viva/engage',
    screenshotAsset: 'viva.png',
    emoji: '💬',
    accent: 'indigo',
    repoConnected: false,
    seed: true,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    shortName: 'Teams',
    url: 'https://teams.microsoft.com',
    emoji: '👥',
    accent: 'violet',
    repoConnected: true,
    repoUrl: 'https://github.com/contoso/teams-web',
    seed: true,
  },
  {
    id: 'outlook',
    name: 'Outlook Web',
    shortName: 'Outlook',
    url: 'https://outlook.office.com',
    emoji: '📧',
    accent: 'blue',
    repoConnected: false,
    seed: true,
  },
  {
    id: 'ms-support',
    name: 'Microsoft Support',
    shortName: 'Support',
    url: 'https://support.microsoft.com/en-us',
    beforeHtmlAsset: 'ms-support-before.html',
    emoji: '🛟',
    accent: 'cyan',
    repoConnected: false,
    seed: true,
  },
];

// ──────────────────────────────────────────────────────────────
// Feedback — every entry is tagged with the website it is about.
// ──────────────────────────────────────────────────────────────
export const feedbackEntries = [
  // ─── Viva Engage ───────────────────────────────────────────
  {
    id: 'fb-001', websiteId: 'viva-engage',
    submitter: 'Sarah M.', role: 'employee', department: 'Marketing', date: '2026-06-18', rating: 4,
    text: "I spent 15 minutes trying to find the settings button on Viva Engage. It's completely hidden and not intuitive at all. I needed to change my notification preferences and couldn't figure out where to go.",
    tags: ['settings', 'navigation', 'viva-engage'],
  },
  {
    id: 'fb-002', websiteId: 'viva-engage',
    submitter: 'James T.', role: 'employee', department: 'Engineering', date: '2026-06-17', rating: 5,
    text: "The settings in Viva Engage are buried. I had to Google how to access my profile settings. There should be a gear icon in the top nav like every other app.",
    tags: ['settings', 'navigation', 'viva-engage'],
  },
  {
    id: 'fb-003', websiteId: 'viva-engage',
    submitter: 'Priya K.', role: 'employee', department: 'HR', date: '2026-06-19', rating: 4,
    text: "New employees keep asking me how to change their Viva Engage settings. The button isn't visible. It should be in the sidebar or top navigation where people expect it.",
    tags: ['settings', 'navigation', 'viva-engage', 'onboarding'],
  },
  {
    id: 'fb-004', websiteId: 'viva-engage',
    submitter: 'Michael R.', role: 'employee', department: 'Sales', date: '2026-06-20', rating: 5,
    text: "Viva Engage notifications are overwhelming but I can't find where to turn them off. The settings page is invisible. Please add a clear settings icon.",
    tags: ['settings', 'notifications', 'viva-engage'],
  },
  {
    id: 'fb-005', websiteId: 'viva-engage',
    submitter: 'Emily W.', role: 'employee', department: 'Design', date: '2026-06-20', rating: 4,
    text: "As a UX designer, the Viva Engage settings discoverability is poor. The gear icon should be persistent in the top-right corner. Current placement violates basic usability heuristics.",
    tags: ['settings', 'navigation', 'viva-engage', 'ux'],
  },
  {
    id: 'fb-006', websiteId: 'viva-engage',
    submitter: 'David L.', role: 'employee', department: 'Finance', date: '2026-06-21', rating: 4,
    text: "I wanted to update my Viva Engage profile picture and couldn't find settings. Ended up clicking random things for 10 minutes. Very frustrating.",
    tags: ['settings', 'profile', 'viva-engage'],
  },
  {
    id: 'fb-007', websiteId: 'viva-engage',
    submitter: 'Anna C.', role: 'customer', department: 'External', date: '2026-06-19', rating: 3,
    text: "The search functionality in the dashboard is slow and doesn't return relevant results. I type a keyword and get unrelated items.",
    tags: ['search', 'performance', 'dashboard'],
  },
  {
    id: 'fb-008', websiteId: 'viva-engage',
    submitter: 'Tom B.', role: 'employee', department: 'Support', date: '2026-06-21', rating: 5,
    text: "I get at least 5 tickets a day from users who can't find Viva Engage settings. It's the #1 support request. A visible gear icon would eliminate most of these tickets.",
    tags: ['settings', 'navigation', 'viva-engage', 'support'],
  },

  // ─── Microsoft Teams ───────────────────────────────────────
  {
    id: 'fb-101', websiteId: 'teams',
    submitter: 'Carlos N.', role: 'employee', department: 'Engineering', date: '2026-06-22', rating: 4,
    text: "During calls the mute and leave buttons disappear after a few seconds. I had to move my mouse around frantically to un-mute myself in a meeting. The controls should stay visible.",
    tags: ['meeting', 'controls', 'navigation', 'teams'],
  },
  {
    id: 'fb-102', websiteId: 'teams',
    submitter: 'Renée P.', role: 'employee', department: 'Product', date: '2026-06-22', rating: 5,
    text: "The meeting toolbar auto-hides and I accidentally clicked 'Leave' when I was trying to find the mute button. Embarrassing on a customer call. Please keep mute pinned.",
    tags: ['meeting', 'controls', 'teams'],
  },
  {
    id: 'fb-103', websiteId: 'teams',
    submitter: 'Wei Z.', role: 'employee', department: 'Sales', date: '2026-06-23', rating: 4,
    text: "I can never find where to share my screen quickly. The share button is hidden in the '...' more menu during calls and takes 3 clicks.",
    tags: ['meeting', 'screen-share', 'navigation', 'teams'],
  },
  {
    id: 'fb-104', websiteId: 'teams',
    submitter: 'Olivia D.', role: 'employee', department: 'HR', date: '2026-06-23', rating: 4,
    text: "New chat messages don't show a clear unread badge when Teams is in the background. I miss messages constantly and people think I'm ignoring them.",
    tags: ['notifications', 'chat', 'teams'],
  },
  {
    id: 'fb-105', websiteId: 'teams',
    submitter: 'Sam K.', role: 'customer', department: 'External', date: '2026-06-24', rating: 5,
    text: "As a guest joining a Teams meeting from the web, the mute control vanished mid-call and I couldn't figure out how to turn my mic back on. Very stressful.",
    tags: ['meeting', 'controls', 'guest', 'teams'],
  },

  // ─── Outlook Web ───────────────────────────────────────────
  {
    id: 'fb-201', websiteId: 'outlook',
    submitter: 'Grace H.', role: 'employee', department: 'Operations', date: '2026-06-22', rating: 4,
    text: "I wanted to schedule an email to send tomorrow morning but couldn't find the 'Schedule send' option. It's hidden behind a tiny arrow next to Send. Took me ages.",
    tags: ['compose', 'schedule-send', 'navigation', 'outlook'],
  },
  {
    id: 'fb-202', websiteId: 'outlook',
    submitter: 'Mateo R.', role: 'employee', department: 'Finance', date: '2026-06-23', rating: 5,
    text: "Schedule send in Outlook web is basically invisible. I sent an email at 2am by accident because I couldn't find how to delay delivery.",
    tags: ['compose', 'schedule-send', 'outlook'],
  },
  {
    id: 'fb-203', websiteId: 'outlook',
    submitter: 'Lena F.', role: 'employee', department: 'Marketing', date: '2026-06-23', rating: 4,
    text: "Attachment previews don't load inline — I have to download every file just to check it's the right one. Slows my whole morning down.",
    tags: ['attachments', 'preview', 'performance', 'outlook'],
  },
  {
    id: 'fb-204', websiteId: 'outlook',
    submitter: 'Priyanka V.', role: 'customer', department: 'External', date: '2026-06-24', rating: 4,
    text: "The 'Schedule send' clock icon is so small I never noticed it existed for months. Make it a labelled button next to Send.",
    tags: ['compose', 'schedule-send', 'ux', 'outlook'],
  },

  // ─── Microsoft Support ─────────────────────────────────────
  {
    id: 'fb-301', websiteId: 'ms-support',
    submitter: 'Diego A.', role: 'customer', department: 'IT', date: '2026-06-25', rating: 5,
    text: "Where are the settings on Microsoft Support? I clicked all over the support page and still can't find the settings button or the settings icon to manage my account settings.",
    tags: ['settings', 'navigation', 'ms-support'],
  },
  {
    id: 'fb-302', websiteId: 'ms-support',
    submitter: 'Hannah B.', role: 'customer', department: 'Customer Success', date: '2026-06-25', rating: 4,
    text: "The account settings button on the support site is impossible to locate. There's no settings gear anywhere in the header. I gave up trying to find settings.",
    tags: ['settings', 'navigation', 'ms-support'],
  },
  {
    id: 'fb-303', websiteId: 'ms-support',
    submitter: 'Yuki T.', role: 'customer', department: 'External', date: '2026-06-26', rating: 4,
    text: "I needed to update my contact preferences but the settings icon is hidden. A visible settings button in the top-right would help me find settings instantly.",
    tags: ['settings', 'navigation', 'ms-support'],
  },
  {
    id: 'fb-304', websiteId: 'ms-support',
    submitter: 'Marcus L.', role: 'customer', department: 'External', date: '2026-06-25', rating: 5,
    text: "Microsoft Support feels completely passive. I have to dig for answers myself — there's no proactive help and no easy way to contact an agent or talk to a person.",
    tags: ['support-experience', 'passive', 'ms-support'],
  },
  {
    id: 'fb-305', websiteId: 'ms-support',
    submitter: 'Nadia R.', role: 'employee', department: 'Operations', date: '2026-06-26', rating: 5,
    text: "The support experience is too reactive. I want proactive suggestions and a clear 'contact an agent' button. Right now it just waits for me with no follow-up.",
    tags: ['support-experience', 'passive', 'ms-support'],
  },
  {
    id: 'fb-306', websiteId: 'ms-support',
    submitter: 'Owen P.', role: 'customer', department: 'Customer Success', date: '2026-06-27', rating: 4,
    text: "Support is passive — articles everywhere but no proactive guidance. I couldn't find a live agent or any way to get a human to follow up on my issue.",
    tags: ['support-experience', 'passive', 'ms-support'],
  },
  {
    id: 'fb-307', websiteId: 'ms-support',
    submitter: 'Sofia G.', role: 'employee', department: 'Engineering', date: '2026-06-25', rating: 4,
    text: "Copilot is completely buried on the support page. I couldn't find the Ask Copilot button anywhere — it should be front and center, not hidden.",
    tags: ['copilot', 'discoverability', 'ms-support'],
  },
  {
    id: 'fb-308', websiteId: 'ms-support',
    submitter: 'Raj M.', role: 'customer', department: 'IT', date: '2026-06-26', rating: 3,
    text: "Where is Copilot on Microsoft Support? The Copilot button is buried at the bottom. I'd use Copilot constantly if the Ask Copilot icon were easy to find.",
    tags: ['copilot', 'discoverability', 'ms-support'],
  },
  {
    id: 'fb-309', websiteId: 'ms-support',
    submitter: 'Elena V.', role: 'customer', department: 'External', date: '2026-06-27', rating: 3,
    text: "Copilot feels hidden on support. Surface the Ask Copilot entry point prominently so people actually discover it instead of leaving it in a corner.",
    tags: ['copilot', 'discoverability', 'ms-support'],
  },
];

// ──────────────────────────────────────────────────────────────
// AI-analyzed pain points — tagged per website.
// ──────────────────────────────────────────────────────────────
export const painPoints = [
  // ─── Viva Engage ───────────────────────────────────────────
  {
    id: 'pp-001', websiteId: 'viva-engage',
    title: 'Settings Button Not Discoverable in Viva Engage',
    severity: 'critical', mentionCount: 7, impactScore: 92,
    departments: ['Marketing', 'Engineering', 'HR', 'Sales', 'Design', 'Finance', 'Support'],
    summary: 'Users consistently cannot locate the settings/preferences button in Viva Engage. The current placement is hidden, leading to frustration, wasted time (avg 10-15 min), and excessive support tickets (~5/day).',
    rootCause: 'The settings access point is buried within a nested menu without a visible icon in the primary navigation. This violates Nielsen\'s "Visibility of System Status" and "Recognition rather than Recall" heuristics.',
    relatedFeedback: ['fb-001', 'fb-002', 'fb-003', 'fb-004', 'fb-005', 'fb-006', 'fb-008'],
    solutions: [
      { id: 'sol-001', type: 'wireframe', title: 'Add Persistent Gear Icon to Top Navigation', description: 'Place a visible gear/settings icon in the top-right corner of the Viva Engage header, consistent with Microsoft 365 app patterns.' },
      { id: 'sol-002', type: 'process-flow', title: 'Redesigned Settings Access Flow', description: 'Process flow diagram showing the improved user journey from any page to settings in 1-2 clicks maximum.' },
      { id: 'sol-003', type: 'walkthrough', title: 'Settings Discovery Walkthrough', description: 'Step-by-step visual guide showing users how to navigate to settings with the proposed new design.' },
    ],
  },
  {
    id: 'pp-002', websiteId: 'viva-engage',
    title: 'Dashboard Search Returns Irrelevant Results',
    severity: 'medium', mentionCount: 1, impactScore: 45,
    departments: ['External'],
    summary: 'Search functionality in the dashboard is slow and returns irrelevant results.',
    rootCause: 'Search indexing may not be properly configured; relevance scoring needs tuning.',
    relatedFeedback: ['fb-007'],
    solutions: [
      { id: 'sol-004', type: 'process-flow', title: 'Improved Search Pipeline', description: 'Process flow showing enhanced search with relevance ranking and real-time filtering.' },
    ],
  },

  // ─── Microsoft Teams ───────────────────────────────────────
  {
    id: 'pp-101', websiteId: 'teams',
    title: 'In-Call Controls Auto-Hide and Cause Mis-Clicks',
    severity: 'critical', mentionCount: 4, impactScore: 88,
    departments: ['Engineering', 'Product', 'Sales', 'External'],
    summary: 'The Teams meeting toolbar (mute, leave, share) auto-hides after a few seconds. Users scramble to un-mute, accidentally click "Leave", and guests get stuck unable to control their mic.',
    rootCause: 'The meeting control bar uses an aggressive auto-hide timer and places "Leave" adjacent to "Mute" with no pinned state. This breaks the heuristic of keeping critical, frequent actions persistently visible.',
    relatedFeedback: ['fb-101', 'fb-102', 'fb-105'],
    solutions: [
      { id: 'sol-101', type: 'process-flow', title: 'Pinned Meeting Controls Flow', description: 'Flow showing mute/camera always pinned, with Leave separated and guarded by a confirm step.' },
      { id: 'sol-102', type: 'walkthrough', title: 'New In-Call Controls Walkthrough', description: 'Step-by-step guide to the always-visible, reorganized meeting control bar.' },
    ],
  },
  {
    id: 'pp-102', websiteId: 'teams',
    title: 'Screen Share Buried in "More" Menu',
    severity: 'medium', mentionCount: 1, impactScore: 52,
    departments: ['Sales'],
    summary: 'Sharing a screen during a call takes 3 clicks because the share action lives inside the "..." overflow menu instead of the primary control bar.',
    rootCause: 'Screen share — a primary meeting action — was deprioritized into the overflow menu, adding friction to the most common presenter task.',
    relatedFeedback: ['fb-103'],
    solutions: [
      { id: 'sol-103', type: 'process-flow', title: 'One-Click Screen Share Flow', description: 'Flow promoting Share to the primary control bar for single-click presenting.' },
    ],
  },

  // ─── Outlook Web ───────────────────────────────────────────
  {
    id: 'pp-201', websiteId: 'outlook',
    title: '"Schedule Send" Is Effectively Hidden',
    severity: 'critical', mentionCount: 3, impactScore: 81,
    departments: ['Operations', 'Finance', 'External'],
    summary: 'Users cannot find Schedule Send — it hides behind a tiny dropdown arrow next to the Send button. People send emails at the wrong time or give up entirely.',
    rootCause: 'Schedule Send is hidden in a split-button caret with no label or icon affordance, so users never discover a high-value feature.',
    relatedFeedback: ['fb-201', 'fb-202', 'fb-204'],
    solutions: [
      { id: 'sol-201', type: 'process-flow', title: 'Discoverable Schedule Send Flow', description: 'Flow adding a labelled clock button beside Send with a clear date/time picker.' },
      { id: 'sol-202', type: 'walkthrough', title: 'Schedule Send Walkthrough', description: 'Step-by-step guide to the new, clearly labelled Schedule Send control.' },
    ],
  },
  {
    id: 'pp-202', websiteId: 'outlook',
    title: 'Attachments Require Download to Preview',
    severity: 'medium', mentionCount: 1, impactScore: 48,
    departments: ['Marketing'],
    summary: 'Inline attachment previews do not load, forcing users to download every file just to verify it — a daily time sink.',
    rootCause: 'The inline preview pane fails to render common file types, so users fall back to downloading.',
    relatedFeedback: ['fb-203'],
    solutions: [
      { id: 'sol-203', type: 'process-flow', title: 'Inline Attachment Preview Flow', description: 'Flow enabling fast hover/click previews without downloading.' },
    ],
  },

  // ─── Microsoft Support ─────────────────────────────────────
  {
    id: 'pp-301', websiteId: 'ms-support',
    title: 'Settings Button Not Discoverable in Microsoft Support',
    severity: 'critical', mentionCount: 3, impactScore: 82,
    departments: ['IT', 'Customer Success', 'External'],
    summary: 'Customers cannot locate account settings on Microsoft Support. There is no visible gear/settings icon in the header, so people abandon tasks like updating contact preferences and managing their account.',
    rootCause: 'Account settings live behind the profile menu with no persistent icon in the primary navigation. This violates Nielsen\'s "Visibility of System Status" and "Recognition rather than Recall" heuristics.',
    relatedFeedback: ['fb-301', 'fb-302', 'fb-303'],
    solutions: [
      { id: 'sol-301', type: 'wireframe', title: 'Add Visible Settings Gear to Support Header', description: 'Place a persistent ⚙️ settings gear icon in the top-right of the Microsoft Support header, next to the profile avatar, giving 1-click access to account settings and preferences.' },
      { id: 'sol-302', type: 'process-flow', title: 'Streamlined Settings Access Flow', description: 'Process flow showing the improved journey from any support page to account settings in a single click.' },
    ],
  },
  {
    id: 'pp-302', websiteId: 'ms-support',
    title: 'Support Experience Feels Passive, Not Proactive',
    severity: 'critical', mentionCount: 3, impactScore: 86,
    departments: ['External', 'Operations', 'Customer Success'],
    summary: 'The support page is reactive — it shows static articles and waits for users to dig for answers. People want proactive guidance and a clear, fast path to contact a live agent or human follow-up.',
    rootCause: 'The page leads with a wall of self-help articles and hides agent/escalation paths. There is no proactive recommendation surface and no prominent "Contact an agent" entry point, so users feel unsupported.',
    relatedFeedback: ['fb-304', 'fb-305', 'fb-306'],
    solutions: [
      { id: 'sol-303', type: 'wireframe', title: 'Add Proactive Help + "Contact an Agent" Panel', description: 'Surface a proactive support panel with recommended next steps and a prominent "Contact an agent" / "Talk to a person" button so users are guided instead of left to search.' },
      { id: 'sol-304', type: 'process-flow', title: 'Proactive Support Escalation Flow', description: 'Process flow turning the passive article hunt into a guided journey: proactive suggestions → quick triage → 1-click handoff to a live agent.' },
    ],
  },
  {
    id: 'pp-303', websiteId: 'ms-support',
    title: 'Copilot Is Buried and Hard to Discover',
    severity: 'high', mentionCount: 3, impactScore: 70,
    departments: ['Engineering', 'IT', 'External'],
    summary: 'Copilot is hidden at the bottom of the support page, so users never discover the fastest way to get answers. People say they would use "Ask Copilot" constantly if the entry point were visible.',
    rootCause: 'The Copilot entry point is placed below the fold with no prominent affordance, burying the highest-value assistance behind static content.',
    relatedFeedback: ['fb-307', 'fb-308', 'fb-309'],
    solutions: [
      { id: 'sol-305', type: 'wireframe', title: 'Surface a Prominent "Ask Copilot" Entry Point', description: 'Promote Copilot to a prominent "Ask Copilot" button/search bar near the top of the support page so users immediately discover AI-assisted help.' },
      { id: 'sol-306', type: 'process-flow', title: 'Copilot-First Support Flow', description: 'Process flow showing a Copilot-first journey: ask in natural language → instant answer or guided steps → escalate only if needed.' },
    ],
  },
];

// ──────────────────────────────────────────────────────────────
// Wireframe data (bespoke Viva Engage settings solution).
// ──────────────────────────────────────────────────────────────
export const wireframes = {
  'sol-001': {
    title: 'Add Settings Gear + “New Post” Button',
    description: 'Proposed UI change — make TWO changes: (1) Add a visible ⚙️ settings gear icon in the top-right navigation bar of Viva Engage, next to the notification bell and profile avatar; and (2) Add a prominent red “+ New post” button at the top of the main feed content area.',
    before: {
      label: 'Current Design (Settings Hidden)',
      elements: [
        { type: 'header', x: 0, y: 0, w: 800, h: 56, label: 'Viva Engage' },
        { type: 'icon', x: 700, y: 16, w: 24, h: 24, label: '🔔', tooltip: 'Notifications' },
        { type: 'icon', x: 740, y: 16, w: 24, h: 24, label: '👤', tooltip: 'Profile' },
        { type: 'sidebar', x: 0, y: 56, w: 200, h: 500, label: 'Navigation' },
        { type: 'nav-item', x: 16, y: 72, w: 168, h: 36, label: '🏠 Home' },
        { type: 'nav-item', x: 16, y: 112, w: 168, h: 36, label: '💬 Communities' },
        { type: 'nav-item', x: 16, y: 152, w: 168, h: 36, label: '📢 Announcements' },
        { type: 'nav-item', x: 16, y: 192, w: 168, h: 36, label: '👥 People' },
        { type: 'content', x: 200, y: 56, w: 600, h: 500, label: 'Feed Content' },
        { type: 'hidden-menu', x: 740, y: 16, w: 24, h: 24, label: '⚙️ Settings (hidden inside profile dropdown → buried 3 clicks deep)', highlight: true },
      ],
    },
    after: {
      label: 'Proposed Design (Settings Visible)',
      elements: [
        { type: 'header', x: 0, y: 0, w: 800, h: 56, label: 'Viva Engage' },
        { type: 'icon-new', x: 660, y: 16, w: 24, h: 24, label: '⚙️', tooltip: 'Settings', highlight: true },
        { type: 'icon', x: 700, y: 16, w: 24, h: 24, label: '🔔', tooltip: 'Notifications' },
        { type: 'icon', x: 740, y: 16, w: 24, h: 24, label: '👤', tooltip: 'Profile' },
        { type: 'sidebar', x: 0, y: 56, w: 200, h: 500, label: 'Navigation' },
        { type: 'nav-item', x: 16, y: 72, w: 168, h: 36, label: '🏠 Home' },
        { type: 'nav-item', x: 16, y: 112, w: 168, h: 36, label: '💬 Communities' },
        { type: 'nav-item', x: 16, y: 152, w: 168, h: 36, label: '📢 Announcements' },
        { type: 'nav-item', x: 16, y: 192, w: 168, h: 36, label: '👥 People' },
        { type: 'nav-item-new', x: 16, y: 440, w: 168, h: 36, label: '⚙️ Settings', highlight: true },
        { type: 'content', x: 200, y: 56, w: 600, h: 500, label: 'Feed Content' },
      ],
    },
    annotations: [
      'Added persistent gear icon in top-right header (1-click access)',
      'Added "Settings" item at bottom of sidebar navigation',
      'Both entry points lead to the same settings panel',
      'Follows Microsoft 365 design pattern (consistent with Teams, Outlook)',
    ],
  },
};

// ──────────────────────────────────────────────────────────────
// Process flows — data-driven (ReactFlow), one per solution.
// ──────────────────────────────────────────────────────────────
const C = {
  start: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  problem: { bg: '#5f1e1e', border: '#ef4444', text: '#fca5a5' },
  badStep: { bg: '#3b2020', border: '#b91c1c', text: '#fca5a5' },
  solution: { bg: '#1e3a2f', border: '#10b981', text: '#6ee7b7' },
  good: { bg: '#1a4a1a', border: '#22c55e', text: '#86efac' },
  detail: { bg: '#2d1b69', border: '#8b5cf6', text: '#c4b5fd' },
  outcome: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
};
const edgeRed = { type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } };
const edgeGreen = { type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } };
const edgePurple = { type: 'smoothstep', style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#8b5cf6' } };
const edgeBlue = { type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3b82f6' } };

export const processFlows = {
  'sol-002': {
    title: 'Redesigned Settings Access Flow — Viva Engage',
    description: 'This process flow shows the improved user journey. Previously, accessing settings required 4+ clicks through hidden menus. The new design provides 1-click access from anywhere.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User wants to change settings', nodeType: 'start', color: C.start } },
      { id: 'current-path', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD PATH\n(Hidden - 4+ clicks)', nodeType: 'problem', color: C.problem } },
      { id: 'new-path', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW PATH\n(Visible - 1 click)', nodeType: 'solution', color: C.solution } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Click profile avatar', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'Find "Settings" in dropdown', nodeType: 'step', color: C.badStep } },
      { id: 'old-3', type: 'custom', position: { x: 0, y: 490 }, data: { label: 'Navigate sub-menu', nodeType: 'step', color: C.badStep } },
      { id: 'old-4', type: 'custom', position: { x: 0, y: 610 }, data: { label: 'Finally reach settings page\n(User frustrated, ~10 min)', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-option-a', type: 'custom', position: { x: 550, y: 250 }, data: { label: 'Option A:\nClick ⚙️ gear icon\nin top-right header', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-option-b', type: 'custom', position: { x: 780, y: 250 }, data: { label: 'Option B:\nClick "Settings"\nin sidebar nav', nodeType: 'solution-step', color: C.solution } },
      { id: 'settings-page', type: 'custom', position: { x: 650, y: 400 }, data: { label: 'Settings Page Opens\n(1 click, < 2 seconds)', nodeType: 'end-good', color: C.good } },
      { id: 'settings-sections', type: 'custom', position: { x: 650, y: 540 }, data: { label: 'Settings Sections:\n• Notifications\n• Privacy\n• Profile\n• Display\n• Language', nodeType: 'detail', color: C.detail } },
      { id: 'result', type: 'custom', position: { x: 650, y: 700 }, data: { label: '🎉 User completes task\nSupport tickets: -80%\nTime saved: ~12 min/user', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e-start-old', source: 'start', target: 'current-path', label: 'Before', ...edgeRed },
      { id: 'e-start-new', source: 'start', target: 'new-path', label: 'After', ...edgeGreen },
      { id: 'e-old-1', source: 'current-path', target: 'old-1', ...edgeRed },
      { id: 'e-old-2', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e-old-3', source: 'old-2', target: 'old-3', ...edgeRed },
      { id: 'e-old-4', source: 'old-3', target: 'old-4', ...edgeRed },
      { id: 'e-new-a', source: 'new-path', target: 'new-option-a', ...edgeGreen },
      { id: 'e-new-b', source: 'new-path', target: 'new-option-b', ...edgeGreen },
      { id: 'e-a-settings', source: 'new-option-a', target: 'settings-page', ...edgeGreen },
      { id: 'e-b-settings', source: 'new-option-b', target: 'settings-page', ...edgeGreen },
      { id: 'e-settings-sections', source: 'settings-page', target: 'settings-sections', ...edgePurple },
      { id: 'e-sections-result', source: 'settings-sections', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Teams: pinned in-call controls ────────────────────────
  'sol-101': {
    title: 'Pinned Meeting Controls Flow — Microsoft Teams',
    description: 'Users lost the mute/leave controls when the toolbar auto-hid. The new design pins critical controls and guards "Leave" behind a confirm step so it can never be clicked by accident.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User is in a Teams call', nodeType: 'start', color: C.start } },
      { id: 'old', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD: Toolbar auto-hides\nafter 3 seconds', nodeType: 'problem', color: C.problem } },
      { id: 'new', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW: Controls pinned\nalways visible', nodeType: 'solution', color: C.solution } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Mouse around to reveal bar', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'Mute & Leave sit side-by-side', nodeType: 'step', color: C.badStep } },
      { id: 'old-3', type: 'custom', position: { x: 0, y: 490 }, data: { label: 'Accidentally click "Leave"\n(dropped from call)', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Mute / Camera pinned\nbottom-center', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 600, y: 380 }, data: { label: 'One tap to mute\n(always reachable)', nodeType: 'end-good', color: C.good } },
      { id: 'new-3', type: 'custom', position: { x: 820, y: 250 }, data: { label: '"Leave" moved to corner\n+ confirm dialog', nodeType: 'solution-step', color: C.solution } },
      { id: 'result', type: 'custom', position: { x: 650, y: 520 }, data: { label: '🎉 Zero accidental leaves\nMis-click rate: -95%', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'start', target: 'new', label: 'After', ...edgeGreen },
      { id: 'e3', source: 'old', target: 'old-1', ...edgeRed },
      { id: 'e4', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e5', source: 'old-2', target: 'old-3', ...edgeRed },
      { id: 'e6', source: 'new', target: 'new-1', ...edgeGreen },
      { id: 'e7', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e8', source: 'new', target: 'new-3', ...edgeGreen },
      { id: 'e9', source: 'new-2', target: 'result', ...edgeBlue },
      { id: 'e10', source: 'new-3', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Teams: one-click screen share ─────────────────────────
  'sol-103': {
    title: 'One-Click Screen Share Flow — Microsoft Teams',
    description: 'Promote Screen Share out of the "..." overflow menu and onto the primary control bar so presenting is a single click.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 350, y: 0 }, data: { label: 'User wants to present', nodeType: 'start', color: C.start } },
      { id: 'old-1', type: 'custom', position: { x: 80, y: 130 }, data: { label: '❌ Click "..." More menu', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 80, y: 250 }, data: { label: 'Scroll list, find "Share"', nodeType: 'step', color: C.badStep } },
      { id: 'old-3', type: 'custom', position: { x: 80, y: 370 }, data: { label: 'Pick window (3 clicks total)', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 560, y: 130 }, data: { label: '✅ "Share" on main bar', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 560, y: 260 }, data: { label: 'Pick window instantly', nodeType: 'end-good', color: C.good } },
      { id: 'result', type: 'custom', position: { x: 560, y: 390 }, data: { label: '🎉 Present in 1 click', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old-1', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e3', source: 'old-2', target: 'old-3', ...edgeRed },
      { id: 'e4', source: 'start', target: 'new-1', label: 'After', ...edgeGreen },
      { id: 'e5', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e6', source: 'new-2', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Viva Engage: search ───────────────────────────────────
  'sol-004': {
    title: 'Improved Search Pipeline — Viva Engage',
    description: 'Add relevance ranking and real-time filtering so search returns useful results quickly.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 350, y: 0 }, data: { label: 'User types a query', nodeType: 'start', color: C.start } },
      { id: 'old-1', type: 'custom', position: { x: 80, y: 130 }, data: { label: '❌ Unindexed full scan', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 80, y: 250 }, data: { label: 'Irrelevant, slow results', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 560, y: 130 }, data: { label: '✅ Indexed + ranked', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 560, y: 250 }, data: { label: 'Real-time filtering', nodeType: 'solution-step', color: C.solution } },
      { id: 'result', type: 'custom', position: { x: 560, y: 380 }, data: { label: '🎉 Relevant results < 300ms', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old-1', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e3', source: 'start', target: 'new-1', label: 'After', ...edgeGreen },
      { id: 'e4', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e5', source: 'new-2', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Outlook: discoverable schedule send ───────────────────
  'sol-201': {
    title: 'Discoverable Schedule Send Flow — Outlook Web',
    description: 'Replace the hidden split-button caret with a labelled clock button beside Send so users can discover and use Schedule Send instantly.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User wants to send later', nodeType: 'start', color: C.start } },
      { id: 'old', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD: hidden caret\nnext to Send', nodeType: 'problem', color: C.problem } },
      { id: 'new', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW: labelled\n🕑 Schedule button', nodeType: 'solution', color: C.solution } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Never notices the arrow', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'Sends at wrong time\nor gives up', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Clicks 🕑 Schedule', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 600, y: 380 }, data: { label: 'Date/time picker opens', nodeType: 'solution-step', color: C.solution } },
      { id: 'result', type: 'custom', position: { x: 600, y: 510 }, data: { label: '🎉 Email queued for the\nright time, first try', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'start', target: 'new', label: 'After', ...edgeGreen },
      { id: 'e3', source: 'old', target: 'old-1', ...edgeRed },
      { id: 'e4', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e5', source: 'new', target: 'new-1', ...edgeGreen },
      { id: 'e6', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e7', source: 'new-2', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Outlook: inline attachment preview ────────────────────
  'sol-203': {
    title: 'Inline Attachment Preview Flow — Outlook Web',
    description: 'Render previews inline so users can verify files without downloading them.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 350, y: 0 }, data: { label: 'User receives attachment', nodeType: 'start', color: C.start } },
      { id: 'old-1', type: 'custom', position: { x: 80, y: 130 }, data: { label: '❌ Preview fails to render', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 80, y: 250 }, data: { label: 'Download every file', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 560, y: 130 }, data: { label: '✅ Hover/click preview', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 560, y: 250 }, data: { label: 'Verify without download', nodeType: 'solution-step', color: C.solution } },
      { id: 'result', type: 'custom', position: { x: 560, y: 380 }, data: { label: '🎉 Minutes saved daily', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old-1', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e3', source: 'start', target: 'new-1', label: 'After', ...edgeGreen },
      { id: 'e4', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e5', source: 'new-2', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Microsoft Support: settings access ────────────────────
  'sol-302': {
    title: 'Streamlined Settings Access Flow — Microsoft Support',
    description: 'Previously, account settings on Microsoft Support hid behind the profile menu with no icon, so users hunted for minutes. The new design adds a persistent gear icon for 1-click access from any page.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User wants to change\naccount settings', nodeType: 'start', color: C.start } },
      { id: 'old', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD: no settings icon\nin the header', nodeType: 'problem', color: C.problem } },
      { id: 'new', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW: ⚙️ gear pinned\ntop-right', nodeType: 'solution', color: C.solution } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Scan the whole page', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'Open profile menu, guess', nodeType: 'step', color: C.badStep } },
      { id: 'old-3', type: 'custom', position: { x: 0, y: 490 }, data: { label: 'Give up / open a ticket\n(frustrated)', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Click ⚙️ gear icon', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 600, y: 380 }, data: { label: 'Settings opens\n(1 click, < 2s)', nodeType: 'end-good', color: C.good } },
      { id: 'result', type: 'custom', position: { x: 600, y: 510 }, data: { label: '🎉 Task done fast\nSupport tickets: -70%', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'start', target: 'new', label: 'After', ...edgeGreen },
      { id: 'e3', source: 'old', target: 'old-1', ...edgeRed },
      { id: 'e4', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e5', source: 'old-2', target: 'old-3', ...edgeRed },
      { id: 'e6', source: 'new', target: 'new-1', ...edgeGreen },
      { id: 'e7', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e8', source: 'new-2', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Microsoft Support: proactive escalation ───────────────
  'sol-304': {
    title: 'Proactive Support Escalation Flow — Microsoft Support',
    description: 'The old experience was passive: a wall of articles with no guidance and a hidden path to a human. The new flow proactively suggests next steps and hands off to a live agent in one click.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User has a problem', nodeType: 'start', color: C.start } },
      { id: 'old', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD: passive wall\nof articles', nodeType: 'problem', color: C.problem } },
      { id: 'new', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW: proactive\nguided support', nodeType: 'solution', color: C.solution } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Read & search alone', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'No "contact agent" path', nodeType: 'step', color: C.badStep } },
      { id: 'old-3', type: 'custom', position: { x: 0, y: 490 }, data: { label: 'Leaves unresolved\n(feels unsupported)', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 560, y: 250 }, data: { label: 'Proactive next-step\nsuggestions', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 560, y: 380 }, data: { label: 'Quick triage\n(2 questions)', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-3', type: 'custom', position: { x: 790, y: 380 }, data: { label: '1-click "Contact an\nagent" handoff', nodeType: 'solution-step', color: C.solution } },
      { id: 'result', type: 'custom', position: { x: 620, y: 520 }, data: { label: '🎉 Resolved with a human\nCSAT: +35%', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'start', target: 'new', label: 'After', ...edgeGreen },
      { id: 'e3', source: 'old', target: 'old-1', ...edgeRed },
      { id: 'e4', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e5', source: 'old-2', target: 'old-3', ...edgeRed },
      { id: 'e6', source: 'new', target: 'new-1', ...edgeGreen },
      { id: 'e7', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e8', source: 'new-2', target: 'new-3', ...edgeGreen },
      { id: 'e9', source: 'new-3', target: 'result', ...edgeBlue },
    ],
  },

  // ─── Microsoft Support: Copilot-first ──────────────────────
  'sol-306': {
    title: 'Copilot-First Support Flow — Microsoft Support',
    description: 'Copilot was buried at the bottom of the page, so users never found it. Promoting "Ask Copilot" to the top turns support into an instant, conversational experience that escalates only when needed.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User needs an answer', nodeType: 'start', color: C.start } },
      { id: 'old', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD: Copilot buried\nbelow the fold', nodeType: 'problem', color: C.problem } },
      { id: 'new', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW: "Ask Copilot"\nat the top', nodeType: 'solution', color: C.solution } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Never sees Copilot', nodeType: 'step', color: C.badStep } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'Scrolls articles manually', nodeType: 'step', color: C.badStep } },
      { id: 'old-3', type: 'custom', position: { x: 0, y: 490 }, data: { label: 'Slow, often gives up', nodeType: 'end-bad', color: C.problem } },
      { id: 'new-1', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Ask in natural language', nodeType: 'solution-step', color: C.solution } },
      { id: 'new-2', type: 'custom', position: { x: 600, y: 380 }, data: { label: 'Instant answer or\nguided steps', nodeType: 'end-good', color: C.good } },
      { id: 'new-3', type: 'custom', position: { x: 820, y: 380 }, data: { label: 'Escalate to agent\nonly if needed', nodeType: 'solution-step', color: C.solution } },
      { id: 'result', type: 'custom', position: { x: 640, y: 520 }, data: { label: '🎉 Answer in seconds\nCopilot usage: +5x', nodeType: 'outcome', color: C.outcome } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'old', label: 'Before', ...edgeRed },
      { id: 'e2', source: 'start', target: 'new', label: 'After', ...edgeGreen },
      { id: 'e3', source: 'old', target: 'old-1', ...edgeRed },
      { id: 'e4', source: 'old-1', target: 'old-2', ...edgeRed },
      { id: 'e5', source: 'old-2', target: 'old-3', ...edgeRed },
      { id: 'e6', source: 'new', target: 'new-1', ...edgeGreen },
      { id: 'e7', source: 'new-1', target: 'new-2', ...edgeGreen },
      { id: 'e8', source: 'new-2', target: 'result', ...edgeBlue },
      { id: 'e9', source: 'new-2', target: 'new-3', ...edgeGreen },
    ],
  },
};

// ──────────────────────────────────────────────────────────────
// Walkthroughs — keyed by solution id, used on the pain-point detail page.
// ──────────────────────────────────────────────────────────────
export const walkthroughs = {
  'sol-003': {
    title: 'Settings Discovery Walkthrough — New Design',
    steps: [
      { title: 'Step 1: Locate the Gear Icon', description: 'Look at the top-right corner of the Viva Engage header. You\'ll see a ⚙️ gear icon between the notification bell and your profile picture.', visual: 'header-gear' },
      { title: 'Step 2: Click the Gear Icon', description: 'Click the ⚙️ gear icon. The Settings panel opens immediately — no dropdowns, no sub-menus.', visual: 'click-gear' },
      { title: 'Step 3: Choose Your Setting Category', description: 'The settings page shows clear categories: Notifications, Privacy, Profile, Display, and Language. Click the one you need.', visual: 'settings-categories' },
      { title: 'Step 4: Make Your Changes', description: 'Toggle switches, dropdowns, and input fields let you adjust settings instantly. Changes save automatically.', visual: 'make-changes' },
      { title: 'Alternative: Sidebar Access', description: 'You can also access Settings from the sidebar navigation. Scroll to the bottom and click "⚙️ Settings".', visual: 'sidebar-access' },
    ],
  },
  'sol-102': {
    title: 'New In-Call Controls Walkthrough — Microsoft Teams',
    steps: [
      { title: 'Step 1: Controls Stay Visible', description: 'The mute, camera, and share buttons are now pinned to the bottom-center of the call and never auto-hide.', visual: 'pinned-bar' },
      { title: 'Step 2: One-Tap Mute', description: 'Your microphone toggle is always reachable — no more mouse-jiggling to un-mute yourself.', visual: 'mute' },
      { title: 'Step 3: Leave Is Protected', description: '"Leave" now lives in the top-right corner and asks for a quick confirmation, so you can never drop the call by accident.', visual: 'leave-confirm' },
      { title: 'Step 4: Share in One Click', description: 'The Share button sits on the primary bar — start presenting instantly without opening the "..." menu.', visual: 'share' },
    ],
  },
  'sol-202': {
    title: 'Schedule Send Walkthrough — Outlook Web',
    steps: [
      { title: 'Step 1: Spot the Clock Button', description: 'When composing, a labelled 🕑 Schedule button now sits right next to Send — no hidden arrows.', visual: 'schedule-button' },
      { title: 'Step 2: Pick a Date & Time', description: 'Click 🕑 Schedule and a clear date/time picker opens with smart suggestions like "Tomorrow 8:00 AM".', visual: 'picker' },
      { title: 'Step 3: Confirm', description: 'Your email is queued and shown in a "Scheduled" folder so you always know what will send and when.', visual: 'scheduled-folder' },
    ],
  },
};

// ──────────────────────────────────────────────────────────────
// Selector helpers — used across the app to scope data to one website.
// ──────────────────────────────────────────────────────────────
export const getWebsite = (websiteId) => websites.find((w) => w.id === websiteId);

export const getFeedbackForWebsite = (websiteId) =>
  feedbackEntries.filter((f) => f.websiteId === websiteId);

export const getPainPointsForWebsite = (websiteId) =>
  painPoints.filter((p) => p.websiteId === websiteId);
