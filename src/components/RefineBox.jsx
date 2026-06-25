import { useState } from 'react';
import { Wand2, RefreshCw, X } from 'lucide-react';

// A small, reusable "this isn't quite right — fix it" control shown under an
// AI-generated artifact (wireframe, process flow, walkthrough). The user types a
// correction note and the parent regenerates with it via `onRefine(note)`.
export default function RefineBox({
  onRefine,
  loading = false,
  label = 'Not quite right?',
  placeholder = 'Describe what to change, e.g. "put the gear icon top-right, not in a menu"',
  accent = 'indigo',
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  const accents = {
    indigo: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/40 text-indigo-300',
    green: 'bg-green-600 hover:bg-green-500 border-green-500/40 text-green-300',
  };
  const btn = accents[accent] || accents.indigo;

  const submit = () => {
    const trimmed = note.trim();
    if (!trimmed || loading) return;
    onRefine(trimmed);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${btn.split(' ').filter((c) => c.startsWith('text-')).join(' ')} hover:underline`}
      >
        <Wand2 className="w-3.5 h-3.5" />
        {label} Refine with a prompt
      </button>
    );
  }

  return (
    <div className="mt-3 bg-gray-900 border border-gray-800 rounded-xl p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-indigo-400" /> Refine this result
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-gray-500 hover:text-gray-300"
          aria-label="Close refine box"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
        }}
        rows={2}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs
                   placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-[10px] text-gray-600 mr-auto">⌘/Ctrl + Enter</span>
        <button
          type="button"
          onClick={submit}
          disabled={loading || !note.trim()}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 ${btn.split(' ').filter((c) => c.startsWith('bg-') || c.startsWith('hover:')).join(' ')}`}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          {loading ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}
