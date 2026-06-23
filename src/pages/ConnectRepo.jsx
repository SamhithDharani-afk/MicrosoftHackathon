import { useState } from 'react';
import { GitBranch, Globe, CheckCircle2, AlertCircle, Link as LinkIcon, Save } from 'lucide-react';

export default function ConnectRepo() {
  const [repoUrl, setRepoUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  const handleConnect = (e) => {
    e.preventDefault();
    // In production, this would validate the repo exists and auth works
    setConnected(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Store in localStorage for other pages to use
    localStorage.setItem('feedbackflow_repo', JSON.stringify({
      repoUrl,
      siteUrl,
      token: token ? '••••••••' : '',
      connectedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-2">Connect Your Product</h1>
      <p className="text-sm text-gray-400 mb-8">
        Link your GitHub repository and live site URL so wireframes can be generated 
        against your real UI and changes can be pushed directly as pull requests.
      </p>

      <form onSubmit={handleConnect} className="space-y-6">
        {/* GitHub Repo */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
            <GitBranch className="w-4 h-4" />
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/your-org/your-frontend-repo"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            The platform will read your UI components to generate accurate wireframes and can create PRs with proposed changes.
          </p>
        </div>

        {/* Live Site URL */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
            <Globe className="w-4 h-4" />
            Live Product URL
          </label>
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://engage.microsoft.com"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used to capture the real UI as the "Before" state in wireframe comparisons.
          </p>
        </div>

        {/* GitHub Token */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1.5">
            <LinkIcon className="w-4 h-4" />
            GitHub Personal Access Token <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Required to create branches and pull requests. Needs <code className="text-indigo-400">repo</code> scope.
          </p>
        </div>

        {/* What this enables */}
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">What connecting enables:</h3>
          <ul className="space-y-2">
            {[
              'Wireframes rendered against your actual UI components & design system',
              'Side-by-side comparison using live site screenshot as "Before"',
              'One-click "Push to GitHub" creates a branch + PR with the proposed UI changes',
              'AI reads your codebase structure to generate implementable code suggestions',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                     text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-4 h-4" />
          Save Connection
        </button>

        {saved && (
          <div className="flex items-center gap-2 justify-center text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Connected successfully!
          </div>
        )}
      </form>

      {/* Connection status */}
      {connected && (
        <div className="mt-8 bg-green-500/5 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold text-green-300">Repository Connected</span>
          </div>
          <p className="text-xs text-gray-400">
            Wireframes will now use your repository's UI components as a reference. 
            The "Push to GitHub" button on wireframe pages will create PRs against this repo.
          </p>
        </div>
      )}
    </div>
  );
}
