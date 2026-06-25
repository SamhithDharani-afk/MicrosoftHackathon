import { useState, useMemo, useCallback, useEffect } from 'react';
import { Sparkles, Copy, Check, RefreshCw, ExternalLink, Wand2 } from 'lucide-react';
import { buildDevPrompt } from '../utils/devPrompt';
import { generateDevPrompt } from '../utils/api';

// An embedded "Ask AI to build this" panel. It turns the proposed change into a
// detailed, copy-paste-ready prompt the user can drop into any external AI coding
// assistant (GitHub Copilot, ChatGPT, etc.) so developers can implement the fix.
// The prompt is generated instantly from a template, and can optionally be refined
// by Copilot on the backend.
export default function AIPromptPanel({ context }) {
  const template = useMemo(() => buildDevPrompt(context), [context]);
  const [prompt, setPrompt] = useState(template);
  const [source, setSource] = useState('template'); // 'template' | 'ai'
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Re-sync prompt when the context changes (e.g. navigating between pain points).
  useEffect(() => {
    setPrompt(template);
    setSource('template');
    setError('');
  }, [template]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy to clipboard — select the text and copy manually.');
    }
  }, [prompt]);

  const handleRefine = useCallback(async () => {
    setRefining(true);
    setError('');
    try {
      const { prompt: refined } = await generateDevPrompt({
        kind: context.kind,
        websiteName: context.websiteName,
        url: context.url,
        painPointSummary: context.painPointSummary,
        fixTitle: context.title,
        fixDescription: context.description,
      });
      setPrompt(refined.trim());
      setSource('ai');
    } catch (e) {
      setError(e.message || 'Could not refine the prompt.');
    } finally {
      setRefining(false);
    }
  }, [context]);

  const resetTemplate = useCallback(() => {
    setPrompt(template);
    setSource('template');
    setError('');
  }, [template]);

  return (
    <div className="mt-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-gray-900 to-gray-900 p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Ask AI to build this</h3>
            <p className="text-xs text-gray-400">
              Copy this ready-made prompt into Copilot, ChatGPT, or any AI coding assistant to implement the change.
            </p>
          </div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0 ${
            source === 'ai'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'bg-gray-700/60 text-gray-300 border border-gray-600'
          }`}
        >
          {source === 'ai' ? 'Copilot-refined' : 'Template'}
        </span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        spellCheck={false}
        className="w-full h-56 resize-y rounded-xl bg-gray-950/70 border border-gray-700 text-gray-200 text-xs leading-relaxed font-mono p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>

        <button
          type="button"
          onClick={handleRefine}
          disabled={refining}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {refining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-indigo-300" />}
          {refining ? 'Refining…' : 'Refine with Copilot'}
        </button>

        {source === 'ai' && !refining && (
          <button
            type="button"
            onClick={resetTemplate}
            className="px-3 py-2 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors"
          >
            Reset to template
          </button>
        )}

        <div className="flex-1" />

        <a
          href="https://copilot.microsoft.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open Copilot
        </a>
        <a
          href="https://chatgpt.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open ChatGPT
        </a>
      </div>
    </div>
  );
}
