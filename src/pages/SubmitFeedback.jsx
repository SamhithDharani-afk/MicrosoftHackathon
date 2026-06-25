import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useWebsites } from '../context/WebsitesContext';
import FeedbackForm from '../components/FeedbackForm';
import ShareFormModal from '../components/ShareFormModal';

export default function SubmitFeedback() {
  const { websites, activeWebsite, activeWebsiteId } = useWebsites();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Submit Feedback</h1>
          <p className="text-sm text-gray-400">
            Your feedback helps us identify issues and build visual solutions. The AI assistant on the right will help you provide the best feedback.
          </p>
        </div>
        <button
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-indigo-500/40 
                     hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-300 text-sm font-medium transition-colors flex-shrink-0"
        >
          <Share2 className="w-4 h-4" />
          Share this form
        </button>
      </div>

      <FeedbackForm />

      {shareOpen && (
        <ShareFormModal
          website={activeWebsite || websites.find((w) => w.id === activeWebsiteId)}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
