// Deterministic layout for AI-generated process flows.
//
// The server returns a small structured object (start / oldLabel+oldSteps /
// newLabel+newSteps / outcome); this builds the ReactFlow nodes + edges from it
// using the same dark palette as the curated flows in mockData, so generated and
// curated flows look identical. Positions are computed (the model never has to
// emit x/y coordinates).

const C = {
  start: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  problem: { bg: '#5f1e1e', border: '#ef4444', text: '#fca5a5' },
  badStep: { bg: '#3b2020', border: '#b91c1c', text: '#fca5a5' },
  solution: { bg: '#1e3a2f', border: '#10b981', text: '#6ee7b7' },
  good: { bg: '#1a4a1a', border: '#22c55e', text: '#86efac' },
  outcome: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
};
const edgeRed = { type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#ef4444' } };
const edgeGreen = { type: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#10b981' } };
const edgeBlue = { type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: '#3b82f6' } };

const STEP_GAP = 120;
const OLD_X = 40;
const NEW_X = 700;
const CENTER_X = 380;

export function buildProcessFlow(flow) {
  const oldSteps = Array.isArray(flow?.oldSteps) ? flow.oldSteps : [];
  const newSteps = Array.isArray(flow?.newSteps) ? flow.newSteps : [];

  const nodes = [];
  const edges = [];

  nodes.push({
    id: 'start',
    type: 'custom',
    position: { x: CENTER_X, y: 0 },
    data: { label: flow?.start || 'User wants to complete a task', nodeType: 'start', color: C.start },
  });

  // Old (problem) column on the left.
  nodes.push({
    id: 'old',
    type: 'custom',
    position: { x: OLD_X + 20, y: 130 },
    data: { label: `❌ OLD\n${flow?.oldLabel || ''}`.trim(), nodeType: 'problem', color: C.problem },
  });
  edges.push({ id: 'e-start-old', source: 'start', target: 'old', label: 'Before', ...edgeRed });
  oldSteps.forEach((step, i) => {
    const id = `old-${i}`;
    const last = i === oldSteps.length - 1;
    nodes.push({
      id,
      type: 'custom',
      position: { x: OLD_X, y: 260 + i * STEP_GAP },
      data: { label: step, nodeType: last ? 'end-bad' : 'step', color: last ? C.problem : C.badStep },
    });
    edges.push({ id: `e-${id}`, source: i === 0 ? 'old' : `old-${i - 1}`, target: id, ...edgeRed });
  });

  // New (solution) column on the right.
  nodes.push({
    id: 'new',
    type: 'custom',
    position: { x: NEW_X, y: 130 },
    data: { label: `✅ NEW\n${flow?.newLabel || ''}`.trim(), nodeType: 'solution', color: C.solution },
  });
  edges.push({ id: 'e-start-new', source: 'start', target: 'new', label: 'After', ...edgeGreen });
  newSteps.forEach((step, i) => {
    const id = `new-${i}`;
    const last = i === newSteps.length - 1;
    nodes.push({
      id,
      type: 'custom',
      position: { x: NEW_X, y: 260 + i * STEP_GAP },
      data: { label: step, nodeType: last ? 'end-good' : 'solution-step', color: last ? C.good : C.solution },
    });
    edges.push({ id: `e-${id}`, source: i === 0 ? 'new' : `new-${i - 1}`, target: id, ...edgeGreen });
  });

  // Outcome node below both columns.
  const maxSteps = Math.max(oldSteps.length, newSteps.length);
  const outcomeY = 260 + Math.max(0, maxSteps - 1) * STEP_GAP + 170;
  nodes.push({
    id: 'outcome',
    type: 'custom',
    position: { x: CENTER_X, y: outcomeY },
    data: { label: `🎉 ${flow?.outcome || 'Problem resolved'}`, nodeType: 'outcome', color: C.outcome },
  });
  if (oldSteps.length) edges.push({ id: 'e-old-outcome', source: `old-${oldSteps.length - 1}`, target: 'outcome', ...edgeBlue });
  if (newSteps.length) edges.push({ id: 'e-new-outcome', source: `new-${newSteps.length - 1}`, target: 'outcome', ...edgeBlue });

  return {
    title: flow?.title || 'Proposed Flow',
    description: flow?.description || '',
    oldLabel: flow?.oldLabel || '',
    newLabel: flow?.newLabel || '',
    outcome: flow?.outcome || '',
    generated: true,
    nodes,
    edges,
  };
}
