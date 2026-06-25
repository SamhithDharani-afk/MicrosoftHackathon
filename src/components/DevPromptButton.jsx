import { useState } from 'react';
import { Code2, Copy, Check, RefreshCw, X, AlertCircle } from 'lucide-react';
import { generateDevPrompt } from '../utils/api';

// "Copy dev prompt" — generates a paste-ready prompt an engineer can drop into
// GitHub Copilot / Claude / Cursor to implement the fix in their own codebase.
// Self-contained: owns its own generation + copy state so it can sit on any
// pain-point view (WireframeView, PainPointDetail).
export default function DevPromptButton({ painPoint, websiteName, url }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      setPrompt(await generateDevPrompt(painPoint, websiteName, url));
    } catch (e) {
      setError(e.message || 'Failed to generate the dev prompt.');
    } finally {
      setLoading(false);
    }
  };

  const openPanel = () => {
    setOpen(true);
    if (!prompt && !loading) run();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable — non-fatal
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPanel}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs font-medium transition-colors"
      >
        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
        Dev prompt
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[28rem] max-w-[calc(100vw-3rem)] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Implementation prompt
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={run}
                disabled={loading}
                title="Regenerate"
                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-[11px] text-gray-500 mb-2">
              Paste into Copilot, Claude or Cursor to implement this fix in your codebase.
            </p>
            {loading ? (
              <div className="py-8 text-center">
                <RefreshCw className="w-6 h-6 text-indigo-400 mx-auto mb-2 animate-spin" />
                <p className="text-xs text-gray-400">Writing the prompt…</p>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  <button onClick={run} className="text-indigo-400 hover:underline mt-1">Try again</button>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  readOnly
                  value={prompt}
                  rows={10}
                  className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-gray-200 text-xs
                             font-mono leading-relaxed focus:outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy prompt'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
