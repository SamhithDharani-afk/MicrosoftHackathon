import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function FlowNode({ data, selected }) {
  const { color, label, nodeType } = data;

  return (
    <div
      className={`
        relative px-4 py-3 min-w-[150px] max-w-[200px] rounded-lg
        transition-all duration-200 shadow-md
        ${selected ? 'scale-105 shadow-xl ring-2 ring-white/30' : ''}
      `}
      style={{
        background: color?.bg || '#1e293b',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: color?.border || '#475569',
      }}
    >
      <div
        className="text-xs font-medium text-center leading-relaxed whitespace-pre-line"
        style={{ color: color?.text || '#f1f5f9' }}
      >
        {label}
      </div>

      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400 !border-gray-600" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400 !border-gray-600" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-gray-400 !border-gray-600" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-gray-400 !border-gray-600" />
    </div>
  );
}

export default memo(FlowNode);
