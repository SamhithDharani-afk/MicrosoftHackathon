import { useParams, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useWebsites } from '../context/WebsitesContext';
import FeedbackForm from '../components/FeedbackForm';
import ThemeToggle from '../components/ThemeToggle';

// Standalone, shareable feedback form (rendered OUTSIDE the app Layout/nav).
// Reached via /form/:websiteId — the link people share like a Google Form.
export default function PublicForm() {
  const { websiteId } = useParams();
  const { websites } = useWebsites();
  const website = websites.find((w) => w.id === websiteId);

  if (!website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold text-white mb-2">Form not found</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          This feedback form link is invalid or the website is no longer accepting feedback.
        </p>
        <Link to="/" className="text-indigo-400 hover:underline">Go to FeedbackFlow</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Lightweight branded header (no app nav) */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            FeedbackFlow
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Powered by FeedbackFlow</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
          {/* Form intro scoped to the shared website */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-4">
              <span className="text-base leading-none">{website.emoji}</span>
              {website.name}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Share your feedback</h1>
            <p className="text-sm text-gray-400">
              Tell the {website.name} team what's working and what isn't. No account needed —
              it takes less than a minute, and the AI assistant will help you be specific.
            </p>
          </div>

          <FeedbackForm lockedWebsiteId={website.id} showDashboardLink={false} />
        </div>
      </main>

      <footer className="border-t border-gray-800 py-5 text-center">
        <p className="text-xs text-gray-600">
          Your response is sent securely to the {website.name} team's dashboard.
        </p>
      </footer>
    </div>
  );
}
