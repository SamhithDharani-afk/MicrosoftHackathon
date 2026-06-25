import { useState, useMemo } from 'react';
import { X, Copy, Check, Link2, Code2, ExternalLink, Mail } from 'lucide-react';

// Modal that exposes the standalone, shareable feedback form for a website —
// a public link (like a Google Form) plus a copy-paste <iframe> embed snippet.
export default function ShareFormModal({ website, onClose }) {
  const [copied, setCopied] = useState(null); // 'link' | 'embed' | null

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = useMemo(
    () => `${origin}/form/${website?.id ?? ''}`,
    [origin, website?.id]
  );
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="900" frameborder="0" title="Feedback form"></iframe>`;
  const mailto = `mailto:?subject=${encodeURIComponent(
    `Share your feedback on ${website?.name ?? 'our product'}`
  )}&body=${encodeURIComponent(
    `Hi,\n\nWe'd love your feedback on ${website?.name ?? 'our product'}. It takes under a minute — no login needed:\n\n${shareUrl}\n\nThanks!`
  )}`;

  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-400" />
            Share this feedback form
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-5">
          Send this link to employees or customers so they can submit feedback about{' '}
          <span className="text-white font-medium">{website?.emoji} {website?.name}</span> without
          signing in or navigating the app. Every submission lands on this website's dashboard.
        </p>

        {/* Shareable link */}
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Shareable link</label>
        <div className="flex gap-2 mb-4">
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.target.select()}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => copy(shareUrl, 'link')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'link' ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Embed snippet */}
        <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5" /> Embed on any page
        </label>
        <div className="relative mb-5">
          <pre className="px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
{embedCode}
          </pre>
          <button
            onClick={() => copy(embedCode, 'embed')}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors"
          >
            {copied === 'embed' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied === 'embed' ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-gray-700 hover:border-gray-500 text-white text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open form
          </a>
          <a
            href={mailto}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-gray-700 hover:border-gray-500 text-white text-sm font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email the link
          </a>
        </div>
      </div>
    </div>
  );
}
