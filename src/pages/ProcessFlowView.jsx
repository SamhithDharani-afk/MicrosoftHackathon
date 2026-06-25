import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { processFlows } from '../data/mockData';
<<<<<<< HEAD
import { resolveWireframeContext } from '../utils/wireframeContext';
import FlowNode from '../components/FlowNode';
import AIPromptPanel from '../components/AIPromptPanel';
=======
import { buildProcessFlow } from '../data/flowLayout';
import { fetchPainPoints, generateProcessFlow } from '../utils/api';
import FlowNode from '../components/FlowNode';
import RefineBox from '../components/RefineBox';
>>>>>>> origin/main

const nodeTypes = { custom: FlowNode };

export default function ProcessFlowView() {
  const { id } = useParams();
  const location = useLocation();

  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refining, setRefining] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // Remember the resolved pain point so "Refine" can regenerate with a note.
  const ppRef = useRef(null);

  const applyGenerated = useCallback(
    (built) => {
      setFlow(built);
      setNodes(built.nodes);
      setEdges(built.edges);
    },
    [setNodes, setEdges]
  );

  // Curated solution ids (sol-xxx) come straight from mockData; pain-point ids
  // are generated (and cached) by the model from the pain point's content.
  useEffect(() => {
    let active = true;
    const staticFlow = processFlows[id];
    if (staticFlow) {
      setFlow(staticFlow);
      setNodes(staticFlow.nodes);
      setEdges(staticFlow.edges);
      setError('');
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError('');
    setFlow(null);
    (async () => {
      try {
        let pp = location.state?.painPoint;
        const websiteName = location.state?.website?.name;
        if (!pp) {
          const { painPoints } = await fetchPainPoints();
          pp = painPoints.find((p) => p.id === id);
        }
        if (!pp) throw new Error('Pain point not found');
        ppRef.current = { pp, websiteName };
        const built = buildProcessFlow(await generateProcessFlow(pp, websiteName));
        if (!active) return;
        applyGenerated(built);
      } catch (e) {
        if (active) setError(e.message || 'Failed to generate process flow');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // setNodes/setEdges are stable; re-run only when the id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRefine = useCallback(
    async (note) => {
      const ctx = ppRef.current;
      if (!ctx) return;
      setRefining(true);
      setError('');
      try {
        const built = buildProcessFlow(
          await generateProcessFlow(ctx.pp, ctx.websiteName, note)
        );
        applyGenerated(built);
      } catch (e) {
        setError(e.message || 'Failed to refine process flow');
      } finally {
        setRefining(false);
      }
    },
    [applyGenerated]
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-lg font-semibold text-white mb-1">Generating process flow…</h2>
        <p className="text-sm text-gray-500">The AI is mapping the before/after journey for this pain point.</p>
      </div>
    );
  }

<<<<<<< HEAD
  const [nodes, , onNodesChange] = useNodesState(flow.nodes);
  const [edges, , onEdgesChange] = useEdgesState(flow.edges);
  const ctx = resolveWireframeContext(id);
=======
  if (error || !flow) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <AlertTriangle className="w-7 h-7 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl text-white mb-1">Couldn’t build the process flow</h2>
        <p className="text-sm text-gray-500 mb-4">{error || 'Process flow not found'}</p>
        <Link to="/dashboard" className="text-indigo-400 hover:underline inline-block">← Back to Dashboard</Link>
      </div>
    );
  }
>>>>>>> origin/main

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">{flow.title}</h1>
      <p className="text-gray-400 mb-6">{flow.description}</p>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500" />
          <span className="text-xs text-gray-400">Old Path (problematic)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
          <span className="text-xs text-gray-400">New Path (solution)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500/30 border border-purple-500" />
          <span className="text-xs text-gray-400">Details</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500" />
          <span className="text-xs text-gray-400">Outcome</span>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="h-[650px] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#374151" gap={20} size={1} />
          <Controls position="bottom-left" />
          <MiniMap
            nodeColor={(node) => node.data?.color?.border || '#6366f1'}
            maskColor="rgba(10, 10, 26, 0.8)"
            position="bottom-right"
          />
        </ReactFlow>
      </div>

      {/* Summary */}
      {flow.generated ? (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Before → After</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400 mb-1">Before</p>
              <p className="text-xs text-gray-400">{flow.oldLabel || 'The current, broken experience.'}</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-green-400 mb-1">After</p>
              <p className="text-xs text-gray-400">{flow.newLabel || 'The proposed, improved experience.'}</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-400 mb-1">Outcome</p>
              <p className="text-xs text-gray-400">{flow.outcome || 'A faster, less frustrating journey.'}</p>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </div>

      {/* Embedded AI prompt helper — turn this flow change into a copy-paste dev prompt */}
      <AIPromptPanel
        context={{
          kind: 'process-flow',
          websiteName: ctx?.websiteName || '',
          url: ctx?.url || '',
          painPointSummary: ctx?.painPointSummary || '',
          title: ctx?.title || flow.title,
          description: ctx?.description || flow.description,
        }}
      />
=======
      ) : (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Key Improvements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400 mb-1">Before</p>
              <p className="text-xs text-gray-400">4+ clicks, ~10 minutes, high frustration, 5 support tickets/day</p>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-green-400 mb-1">After</p>
              <p className="text-xs text-gray-400">1 click, &lt;2 seconds, zero confusion, minimal support load</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-400 mb-1">Impact</p>
              <p className="text-xs text-gray-400">-80% support tickets, ~12 min saved per user, improved satisfaction</p>
            </div>
          </div>
        </div>
      )}

      {/* Refine — only for AI-generated flows (curated demo flows are fixed). */}
      {flow.generated && (
        <RefineBox
            loading={refining}
            onRefine={handleRefine}
            placeholder='Describe what to change, e.g. "the old path should have 4 steps and mention the search bar"'
        />
      )}
>>>>>>> origin/main
    </div>
  );
}
