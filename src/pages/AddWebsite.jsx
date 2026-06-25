import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, GitBranch, CheckCircle2, ChevronDown, ChevronRight, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { useWebsites } from '../context/WebsitesContext';

const EMOJI_CHOICES = ['🌐', '💬', '👥', '📧', '📊', '🛒', '🎮', '📱', '🧩', '⚙️'];

export default function AddWebsite() {
  const navigate = useNavigate();
  const { addWebsite } = useWebsites();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [emoji, setEmoji] = useState('🌐');
  const [analyzing, setAnalyzing] = useState(false);

  // Optional repo connection — collapsed by default.
  const [showRepo, setShowRepo] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');

  const canSubmit = name.trim() && url.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setAnalyzing(true);
    // Simulate the AI "scanning" the uploaded site to learn its UI.
    setTimeout(() => {
      addWebsite({ name: name.trim(), url: url.trim(), emoji, repoUrl: repoUrl.trim() });
      setAnalyzing(false);
      navigate('/dashboard');
    }, 1600);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      {analyzing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scanning your website…</h3>
            <p className="text-sm text-gray-400">
              The AI is capturing {name || 'your site'}'s UI so it can generate accurate, on-brand wireframes.
            </p>
          </div>
        </div>
      )}

      {/* Primary: upload your website */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        Step 1 · Give the AI your product
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Add a website</h1>
      <p className="text-sm text-gray-400 mb-8">
        Add the website you want feedback on. The AI captures its real UI so every wireframe,
        process flow, and walkthrough is generated against <em>your</em> actual product — not a generic mockup.
        Each website gets its own dashboard of pain points.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Website name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Website / product name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Contoso Portal"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>

        {/* Website URL — the star of the page */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
            <Globe className="w-4 h-4 text-indigo-400" />
            Live website URL
          </label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-product.com"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-indigo-500/40 text-white text-base
                       focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-colors"
          />
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
            <Camera className="w-3.5 h-3.5" />
            The AI screenshots this URL to learn your layout and use it as the “Before” state in wireframes.
          </p>
        </div>

        {/* Icon picker */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Pick an icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border transition-colors
                  ${emoji === e ? 'border-indigo-500 bg-indigo-500/20' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Optional: connect repo (collapsed) */}
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRepo((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <GitBranch className="w-4 h-4 text-gray-500" />
              Connect a GitHub repo
              <span className="text-xs font-normal text-gray-500">· optional, adds extra context</span>
            </span>
            {showRepo ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showRepo && (
            <div className="px-4 pb-4 pt-1 space-y-4 border-t border-gray-800 animate-fade-in">
              <p className="text-xs text-gray-500">
                Connecting a repo is <strong>not required</strong>. It just lets the AI read your real
                components for more implementable suggestions and one-click “Push to GitHub” PRs.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">GitHub repository URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-org/your-frontend-repo"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                             focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Personal access token <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                             focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                     disabled:opacity-40 disabled:cursor-not-allowed
                     text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          Add website & analyze
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* What you get */}
      <div className="mt-8 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          What adding a website gives you
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          {[
            'A dedicated dashboard showing only the pain points your users reported for this site',
            'Wireframes rendered against your real UI captured from the live URL',
            'Process flows & walkthroughs tailored to that product’s feedback',
            'Switch between websites any time from the dashboard selector',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
