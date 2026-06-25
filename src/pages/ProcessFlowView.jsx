import { useParams, Link } from 'react-router-dom';
import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft } from 'lucide-react';
import { processFlows } from '../data/mockData';
import { resolveWireframeContext } from '../utils/wireframeContext';
import FlowNode from '../components/FlowNode';
import AIPromptPanel from '../components/AIPromptPanel';

const nodeTypes = { custom: FlowNode };

export default function ProcessFlowView() {
  const { id } = useParams();
  const flow = processFlows[id];

  if (!flow) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl text-white">Process flow not found</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  const [nodes, , onNodesChange] = useNodesState(flow.nodes);
  const [edges, , onEdgesChange] = useEdgesState(flow.edges);
  const ctx = resolveWireframeContext(id);

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
    </div>
  );
}
