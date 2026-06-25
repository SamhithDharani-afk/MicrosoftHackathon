import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, ImagePlus, X, Sparkles, MessageCircle, Lightbulb, AlertTriangle, ChevronRight } from 'lucide-react';
import { useWebsites } from '../context/WebsitesContext';
import { submitFeedback, assistFeedback } from '../utils/api';
import { severityMeta } from '../utils/severity';

// ──────────────────────────────────────────────
// AI Companion — grades feedback text in real-time with GPT (GitHub Models)
// ──────────────────────────────────────────────

// Smart question prompts based on category
const CATEGORY_PROMPTS = {
  'general': "What specific issue are you experiencing? Include which product, feature, or page is affected.",
  'ui-ux': "Which screen or page has the UI issue? Describe what you see vs. what you'd expect to see.",
  'performance': "Which action is slow? How long does it take vs. how long you'd expect? Does it happen consistently?",
  'feature-request': "What are you trying to accomplish that you currently can't? How do you work around it today?",
  'bug': "What steps reproduce the bug? What happens vs. what should happen? Include any error messages.",
  'navigation': "What were you looking for, and where did you expect to find it? How many clicks did it take?",
};

function AICompanion({ feedback, category, hasImages, onSuggestInsert }) {
  const prompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['general'];
  const hasText = !!feedback.trim();

  // Live AI analysis (GitHub Models, via /api/assist): debounced ~400ms with
  // in-flight cancellation. This is the ONLY source of the quality score, nudges
  // and suggestions — there is no heuristic grader, so the signals never
  // flip-flop between two different scorers. The previous AI result stays on
  // screen while the next one loads, to avoid flicker as the user types.
  const [ai, setAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  useEffect(() => {
    if (!hasText) {
      setAi(null);
      setAiLoading(false);
      setAiError(false);
      return undefined;
    }
    const controller = new AbortController();
    setAiLoading(true);
    setAiError(false);
    const timer = setTimeout(async () => {
      try {
        const r = await assistFeedback({ text: feedback, category, hasImages }, controller.signal);
        if (controller.signal.aborted) return;
        if (r && r.ok) {
          setAi(r);
        } else {
          setAi(null);
          setAiError(true);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setAi(null);
          setAiError(true);
        }
      } finally {
        if (!controller.signal.aborted) setAiLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [feedback, category, hasImages, hasText]);

  const feedbackScore = ai ? ai.score : 0;
  const nudges = ai ? ai.nudges : [];
  const suggestions = ai ? ai.suggestions : [];

  const scoreColor = feedbackScore >= 70 ? 'text-green-400' : feedbackScore >= 40 ? 'text-amber-400' : 'text-gray-500';
  const scoreLabel = feedbackScore >= 70 ? 'Great detail' : feedbackScore >= 40 ? 'Getting there' : 'Needs more detail';

  const subtitle = aiLoading
    ? 'Analyzing your feedback…'
    : aiError
    ? 'AI analysis unavailable'
    : 'AI-powered feedback coaching';

  return (
    <div className="space-y-4">
      {/* AI Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white">AI Assistant</span>
          <p className="text-[10px] text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* Feedback quality — graded only by the AI (no heuristic fallback) */}
      {hasText && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          {ai ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Feedback Quality</span>
                <span className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    feedbackScore >= 70 ? 'bg-green-500' : feedbackScore >= 40 ? 'bg-amber-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${feedbackScore}%` }}
                />
              </div>
            </>
          ) : aiError ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Couldn't reach the AI grader — your feedback will still be submitted.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Feedback Quality</span>
                <span className="text-xs text-gray-500 animate-pulse">Analyzing…</span>
              </div>
              <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="animate-indeterminate rounded-full bg-gray-500" />
              </div>
            </>
          )}
        </div>
      )}

      {/* Category-specific prompt */}
      {!feedback.trim() && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-300 leading-relaxed">{prompt}</p>
          </div>
        </div>
      )}

      {/* Active nudges */}
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className={`rounded-lg p-3 border animate-fade-in ${
            nudge.type === 'success'
              ? 'bg-green-500/5 border-green-500/20'
              : nudge.type === 'warning'
              ? 'bg-amber-500/5 border-amber-500/20'
              : nudge.type === 'nudge'
              ? 'bg-orange-500/5 border-orange-500/20'
              : 'bg-blue-500/5 border-blue-500/20'
          }`}
        >
          <div className="flex items-start gap-2">
            {nudge.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            ) : nudge.type === 'warning' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Lightbulb className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            )}
            <p
              className={`text-xs leading-relaxed ${
                nudge.type === 'success' ? 'text-green-300' : nudge.type === 'warning' ? 'text-amber-300' : nudge.type === 'nudge' ? 'text-orange-300' : 'text-blue-300'
              }`}
              dangerouslySetInnerHTML={{
                __html: nudge.message
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }}
            />
          </div>
        </div>
      ))}

      {/* Quick-insert suggestions */}
      {suggestions.length > 0 && feedback.length > 5 && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Try adding:</p>
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSuggestInsert(s)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 
                           text-xs text-gray-300 hover:border-indigo-500/50 hover:text-white hover:bg-gray-750 
                           transition-colors text-left group"
              >
                <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                <span className="italic">"{s}"</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Reusable feedback form (used in-app and on the public shared link)
// ──────────────────────────────────────────────
//
// Props:
//   lockedWebsiteId   – if set, the website is fixed and the selector is hidden
//                       (used by the shareable /form/:websiteId link)
//   showDashboardLink – show the "View on Dashboard" link after submit
//                       (false for the public form, which visitors shouldn't see)

export default function FeedbackForm({ lockedWebsiteId = null, showDashboardLink = true }) {
  const { websites, activeWebsiteId } = useWebsites();
  const initialWebsiteId = lockedWebsiteId || activeWebsiteId;

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    role: 'employee',
    department: '',
    rating: 3,
    feedback: '',
    category: 'general',
    websiteId: initialWebsiteId,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitFeedback({
        websiteId: form.websiteId,
        submitter: form.name,
        role: form.role,
        department: form.department,
        rating: form.rating,
        text: form.feedback,
        category: form.category,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuggestInsert = useCallback((text) => {
    const sep = form.feedback.endsWith(' ') || !form.feedback ? '' : ' ';
    setForm(prev => ({ ...prev, feedback: prev.feedback + sep + text }));
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [form.feedback]);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
        <p className="text-gray-400 mb-6">
          Your feedback about {websites.find(w => w.id === form.websiteId)?.name || 'the website'} was received.
          Our AI analyzes it alongside other submissions to identify patterns and generate visual solutions.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { setSubmitted(false); setImages([]); setForm({ name: '', role: 'employee', department: '', rating: 3, feedback: '', category: 'general', websiteId: initialWebsiteId }); }}
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-gray-700 hover:border-gray-500 text-white text-sm font-medium transition-colors"
          >
            Submit Another
          </button>
          {showDashboardLink && (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              View on Dashboard
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left: Form */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-5">
        {/* Which website is this about — hidden when the form is locked to one site */}
        {!lockedWebsiteId && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Which website is this about?</label>
            <select
              value={form.websiteId}
              onChange={(e) => setForm({ ...form, websiteId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-indigo-500/40 text-white text-sm
                         focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>{w.emoji} {w.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Feedback is routed to this website's dashboard so its pain points stay separate.
            </p>
          </div>
        )}

        {/* Name & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
              <option value="contractor">Contractor</option>
            </select>
          </div>
        </div>

        {/* Department & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="Engineering, Marketing, etc."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="general">General</option>
              <option value="ui-ux">UI/UX Issue</option>
              <option value="performance">Performance</option>
              <option value="feature-request">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="navigation">Navigation/Findability</option>
            </select>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Severity (1 = Mild, 5 = Critical)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, rating: n })}
                className={`w-9 h-9 rounded-lg font-medium text-sm transition-all
                  ${form.rating === n
                    ? `${severityMeta(n).solid} text-white scale-110`
                    : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Selected: <span className={severityMeta(form.rating).text}>{severityMeta(form.rating).label}</span>
            <span className="text-gray-600"> · 1 = Mild → 5 = Critical</span>
          </p>
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Describe the issue
          </label>
          <textarea
            ref={textareaRef}
            required
            rows={6}
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 
                       transition-colors resize-none"
            placeholder="Be specific: What were you trying to do? What happened? What did you expect?"
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Screenshots <span className="text-gray-500 font-normal">(optional)</span>
          </label>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.preview}
                    alt={`Screenshot ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(img.preview);
                      setImages(images.filter((_, idx) => idx !== i));
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const newImages = files.map(file => ({
                file,
                preview: URL.createObjectURL(file),
              }));
              setImages([...images, ...newImages]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-700
                       text-xs text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/5
                       transition-colors cursor-pointer"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            {images.length === 0 ? 'Upload screenshots' : 'Add more'}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Saving…' : 'Submit Feedback'}
        </button>

        {submitError && (
          <div className="flex items-center gap-2 justify-center text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {submitError}
          </div>
        )}
      </form>

      {/* Right: AI Companion */}
      <div className="w-72 flex-shrink-0 hidden md:block">
        <div className="sticky top-24 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <AICompanion
            feedback={form.feedback}
            category={form.category}
            hasImages={images.length > 0}
            onSuggestInsert={handleSuggestInsert}
          />
        </div>
      </div>
    </div>
  );
}
