// Mock feedback data — pre-populated with Viva Engage "can't find settings" example
export const feedbackEntries = [
  {
    id: 'fb-001',
    submitter: 'Sarah M.',
    role: 'employee',
    department: 'Marketing',
    date: '2026-06-18',
    rating: 2,
    text: "I spent 15 minutes trying to find the settings button on Viva Engage. It's completely hidden and not intuitive at all. I needed to change my notification preferences and couldn't figure out where to go.",
    tags: ['settings', 'navigation', 'viva-engage'],
  },
  {
    id: 'fb-002',
    submitter: 'James T.',
    role: 'employee',
    department: 'Engineering',
    date: '2026-06-17',
    text: "The settings in Viva Engage are buried. I had to Google how to access my profile settings. There should be a gear icon in the top nav like every other app.",
    rating: 1,
    tags: ['settings', 'navigation', 'viva-engage'],
  },
  {
    id: 'fb-003',
    submitter: 'Priya K.',
    role: 'employee',
    department: 'HR',
    date: '2026-06-19',
    text: "New employees keep asking me how to change their Viva Engage settings. The button isn't visible. It should be in the sidebar or top navigation where people expect it.",
    rating: 2,
    tags: ['settings', 'navigation', 'viva-engage', 'onboarding'],
  },
  {
    id: 'fb-004',
    submitter: 'Michael R.',
    role: 'employee',
    department: 'Sales',
    date: '2026-06-20',
    text: "Viva Engage notifications are overwhelming but I can't find where to turn them off. The settings page is invisible. Please add a clear settings icon.",
    rating: 1,
    tags: ['settings', 'notifications', 'viva-engage'],
  },
  {
    id: 'fb-005',
    submitter: 'Emily W.',
    role: 'employee',
    department: 'Design',
    date: '2026-06-20',
    text: "As a UX designer, the Viva Engage settings discoverability is poor. The gear icon should be persistent in the top-right corner. Current placement violates basic usability heuristics.",
    rating: 2,
    tags: ['settings', 'navigation', 'viva-engage', 'ux'],
  },
  {
    id: 'fb-006',
    submitter: 'David L.',
    role: 'employee',
    department: 'Finance',
    date: '2026-06-21',
    text: "I wanted to update my Viva Engage profile picture and couldn't find settings. Ended up clicking random things for 10 minutes. Very frustrating.",
    rating: 2,
    tags: ['settings', 'profile', 'viva-engage'],
  },
  {
    id: 'fb-007',
    submitter: 'Anna C.',
    role: 'customer',
    department: 'External',
    date: '2026-06-19',
    text: "The search functionality in the dashboard is slow and doesn't return relevant results. I type a keyword and get unrelated items.",
    rating: 3,
    tags: ['search', 'performance', 'dashboard'],
  },
  {
    id: 'fb-008',
    submitter: 'Tom B.',
    role: 'employee',
    department: 'Support',
    date: '2026-06-21',
    text: "I get at least 5 tickets a day from users who can't find Viva Engage settings. It's the #1 support request. A visible gear icon would eliminate most of these tickets.",
    rating: 1,
    tags: ['settings', 'navigation', 'viva-engage', 'support'],
  },
];

// AI-analyzed pain points extracted from feedback
export const painPoints = [
  {
    id: 'pp-001',
    title: 'Settings Button Not Discoverable in Viva Engage',
    severity: 'critical',
    mentionCount: 7,
    impactScore: 92,
    departments: ['Marketing', 'Engineering', 'HR', 'Sales', 'Design', 'Finance', 'Support'],
    summary: 'Users consistently cannot locate the settings/preferences button in Viva Engage. The current placement is hidden, leading to frustration, wasted time (avg 10-15 min), and excessive support tickets (~5/day).',
    rootCause: 'The settings access point is buried within a nested menu without a visible icon in the primary navigation. This violates Nielsen\'s "Visibility of System Status" and "Recognition rather than Recall" heuristics.',
    relatedFeedback: ['fb-001', 'fb-002', 'fb-003', 'fb-004', 'fb-005', 'fb-006', 'fb-008'],
    solutions: [
      {
        id: 'sol-001',
        type: 'wireframe',
        title: 'Add Persistent Gear Icon to Top Navigation',
        description: 'Place a visible gear/settings icon in the top-right corner of the Viva Engage header, consistent with Microsoft 365 app patterns.',
      },
      {
        id: 'sol-002',
        type: 'process-flow',
        title: 'Redesigned Settings Access Flow',
        description: 'Process flow diagram showing the improved user journey from any page to settings in 1-2 clicks maximum.',
      },
      {
        id: 'sol-003',
        type: 'walkthrough',
        title: 'Settings Discovery Walkthrough',
        description: 'Step-by-step visual guide showing users how to navigate to settings with the proposed new design.',
      },
    ],
  },
  {
    id: 'pp-002',
    title: 'Dashboard Search Returns Irrelevant Results',
    severity: 'medium',
    mentionCount: 1,
    impactScore: 45,
    departments: ['External'],
    summary: 'Search functionality in the dashboard is slow and returns irrelevant results.',
    rootCause: 'Search indexing may not be properly configured; relevance scoring needs tuning.',
    relatedFeedback: ['fb-007'],
    solutions: [
      {
        id: 'sol-004',
        type: 'process-flow',
        title: 'Improved Search Pipeline',
        description: 'Process flow showing enhanced search with relevance ranking and real-time filtering.',
      },
    ],
  },
];

// Wireframe data for the Viva Engage settings solution
export const wireframes = {
  'sol-001': {
    title: 'Add Persistent Gear Icon to Top Navigation',
    description: 'Proposed UI change: Add a visible ⚙️ settings gear icon in the top-right navigation bar of Viva Engage, next to the notification bell and profile avatar.',
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

// Process flow for the settings access redesign
export const processFlows = {
  'sol-002': {
    title: 'Redesigned Settings Access Flow — Viva Engage',
    description: 'This process flow shows the improved user journey. Previously, accessing settings required 4+ clicks through hidden menus. The new design provides 1-click access from anywhere.',
    nodes: [
      { id: 'start', type: 'custom', position: { x: 400, y: 0 }, data: { label: 'User wants to change settings', nodeType: 'start', color: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' } } },
      { id: 'current-path', type: 'custom', position: { x: 100, y: 120 }, data: { label: '❌ OLD PATH\n(Hidden - 4+ clicks)', nodeType: 'problem', color: { bg: '#5f1e1e', border: '#ef4444', text: '#fca5a5' } } },
      { id: 'new-path', type: 'custom', position: { x: 650, y: 120 }, data: { label: '✅ NEW PATH\n(Visible - 1 click)', nodeType: 'solution', color: { bg: '#1e3a2f', border: '#10b981', text: '#6ee7b7' } } },
      { id: 'old-1', type: 'custom', position: { x: 0, y: 250 }, data: { label: 'Click profile avatar', nodeType: 'step', color: { bg: '#3b2020', border: '#b91c1c', text: '#fca5a5' } } },
      { id: 'old-2', type: 'custom', position: { x: 0, y: 370 }, data: { label: 'Find "Settings" in dropdown', nodeType: 'step', color: { bg: '#3b2020', border: '#b91c1c', text: '#fca5a5' } } },
      { id: 'old-3', type: 'custom', position: { x: 0, y: 490 }, data: { label: 'Navigate sub-menu', nodeType: 'step', color: { bg: '#3b2020', border: '#b91c1c', text: '#fca5a5' } } },
      { id: 'old-4', type: 'custom', position: { x: 0, y: 610 }, data: { label: 'Finally reach settings page\n(User frustrated, ~10 min)', nodeType: 'end-bad', color: { bg: '#5f1e1e', border: '#ef4444', text: '#fca5a5' } } },
      { id: 'new-option-a', type: 'custom', position: { x: 550, y: 250 }, data: { label: 'Option A:\nClick ⚙️ gear icon\nin top-right header', nodeType: 'solution-step', color: { bg: '#1e3a2f', border: '#10b981', text: '#6ee7b7' } } },
      { id: 'new-option-b', type: 'custom', position: { x: 780, y: 250 }, data: { label: 'Option B:\nClick "Settings"\nin sidebar nav', nodeType: 'solution-step', color: { bg: '#1e3a2f', border: '#10b981', text: '#6ee7b7' } } },
      { id: 'settings-page', type: 'custom', position: { x: 650, y: 400 }, data: { label: 'Settings Page Opens\n(1 click, < 2 seconds)', nodeType: 'end-good', color: { bg: '#1a4a1a', border: '#22c55e', text: '#86efac' } } },
      { id: 'settings-sections', type: 'custom', position: { x: 650, y: 540 }, data: { label: 'Settings Sections:\n• Notifications\n• Privacy\n• Profile\n• Display\n• Language', nodeType: 'detail', color: { bg: '#2d1b69', border: '#8b5cf6', text: '#c4b5fd' } } },
      { id: 'result', type: 'custom', position: { x: 650, y: 700 }, data: { label: '🎉 User completes task\nSupport tickets: -80%\nTime saved: ~12 min/user', nodeType: 'outcome', color: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' } } },
    ],
    edges: [
      { id: 'e-start-old', source: 'start', target: 'current-path', type: 'smoothstep', label: 'Before', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } },
      { id: 'e-start-new', source: 'start', target: 'new-path', type: 'smoothstep', label: 'After', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } },
      { id: 'e-old-1', source: 'current-path', target: 'old-1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } },
      { id: 'e-old-2', source: 'old-1', target: 'old-2', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } },
      { id: 'e-old-3', source: 'old-2', target: 'old-3', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } },
      { id: 'e-old-4', source: 'old-3', target: 'old-4', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } },
      { id: 'e-new-a', source: 'new-path', target: 'new-option-a', type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } },
      { id: 'e-new-b', source: 'new-path', target: 'new-option-b', type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } },
      { id: 'e-a-settings', source: 'new-option-a', target: 'settings-page', type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } },
      { id: 'e-b-settings', source: 'new-option-b', target: 'settings-page', type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } },
      { id: 'e-settings-sections', source: 'settings-page', target: 'settings-sections', type: 'smoothstep', style: { stroke: '#8b5cf6', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#8b5cf6' } },
      { id: 'e-sections-result', source: 'settings-sections', target: 'result', type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3b82f6' } },
    ],
  },
};

// Walkthrough steps for the Viva Engage settings
export const walkthroughs = {
  'sol-003': {
    title: 'Settings Discovery Walkthrough — New Design',
    steps: [
      {
        title: 'Step 1: Locate the Gear Icon',
        description: 'Look at the top-right corner of the Viva Engage header. You\'ll see a ⚙️ gear icon between the notification bell and your profile picture.',
        visual: 'header-gear',
      },
      {
        title: 'Step 2: Click the Gear Icon',
        description: 'Click the ⚙️ gear icon. The Settings panel opens immediately — no dropdowns, no sub-menus.',
        visual: 'click-gear',
      },
      {
        title: 'Step 3: Choose Your Setting Category',
        description: 'The settings page shows clear categories: Notifications, Privacy, Profile, Display, and Language. Click the one you need.',
        visual: 'settings-categories',
      },
      {
        title: 'Step 4: Make Your Changes',
        description: 'Toggle switches, dropdowns, and input fields let you adjust settings instantly. Changes save automatically.',
        visual: 'make-changes',
      },
      {
        title: 'Alternative: Sidebar Access',
        description: 'You can also access Settings from the sidebar navigation. Scroll to the bottom and click "⚙️ Settings".',
        visual: 'sidebar-access',
      },
    ],
  },
};
