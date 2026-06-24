import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, CheckCircle2, ImagePlus, X, Sparkles, MessageCircle, Lightbulb, AlertTriangle, ChevronRight } from 'lucide-react';
import { useWebsites } from '../context/WebsitesContext';

// ──────────────────────────────────────────────
// AI Companion — analyzes feedback text in real-time and gives nudges
// ──────────────────────────────────────────────

const NUDGE_RULES = [
  {
    id: 'too-short',
    check: (text) => text.length > 0 && text.length < 40,
    type: 'warning',
    message: "Your feedback is a bit short. Try describing **what you were trying to do**, **what happened**, and **what you expected**.",
  },
  {
    id: 'no-specifics',
    check: (text) => text.length > 30 && !/button|page|screen|menu|tab|icon|link|dropdown|sidebar|header|modal|popup|search|setting/i.test(text),
    type: 'tip',
    message: "Try mentioning specific UI elements (e.g., a button, menu, page, or screen) so the AI can generate more accurate wireframes.",
  },
  {
    id: 'no-action',
    check: (text) => text.length > 30 && !/click|tap|find|open|navigate|access|search|scroll|locate|tried|wanted|looking/i.test(text),
    type: 'tip',
    message: "What action were you trying to take? Phrases like *\"I tried to...\"* or *\"I was looking for...\"* help us understand the workflow.",
  },
  {
    id: 'no-outcome',
    check: (text) => text.length > 50 && !/couldn't|can't|unable|doesn't|didn't|broken|missing|hidden|confusing|frustrated|slow|error|fail|wrong|impossible/i.test(text),
    type: 'tip',
    message: "What went wrong? Mentioning the outcome (e.g., *\"couldn't find it\"*, *\"it was hidden\"*, *\"got an error\"*) helps pinpoint the issue.",
  },
  {
    id: 'great-detail',
    check: (text) => {
      const hasElement = /button|page|screen|menu|icon|setting|sidebar|header/i.test(text);
      const hasAction = /click|tap|find|navigate|tried|looking|wanted/i.test(text);
      const hasOutcome = /couldn't|can't|hidden|confusing|missing|slow|error|broken/i.test(text);
      return text.length > 60 && hasElement && hasAction && hasOutcome;
    },
    type: 'success',
    message: "Excellent feedback! You've described the element, what you tried, and what went wrong. This gives the AI everything it needs.",
  },
  {
    id: 'has-time',
    check: (text) => /\d+\s*(min|minute|hour|second)/i.test(text),
    type: 'success',
    message: "Great — including time impact helps managers prioritize this issue.",
  },
  {
    id: 'vague',
    check: (text) => text.length > 20 && /it sucks|bad|terrible|awful|hate it|don't like|not good|ugh/i.test(text) && text.length < 80,
    type: 'nudge',
    message: "We hear you! Can you tell us **specifically** what's not working? For example: *\"The settings button is hard to find because...\"*",
  },
  {
    id: 'suggest-screenshot',
    check: (text, { hasImages }) => text.length > 40 && !hasImages && /see|look|visual|display|layout|ui|design|interface|position/i.test(text),
    type: 'tip',
    message: "Since you're describing something visual, attaching a screenshot would really help the AI understand the issue. Use the upload area below!",
  },
];

function getActiveNudges(text, context) {
  if (!text.trim()) return [];
  return NUDGE_RULES.filter(rule => rule.check(text, context));
}

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
  const nudges = getActiveNudges(feedback, { hasImages });
  const prompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['general'];

  const feedbackScore = (() => {
    if (!feedback.trim()) return 0;
    let score = 0;
    if (feedback.length > 30) score += 20;
    if (feedback.length > 80) score += 15;
    if (/button|page|screen|menu|icon|setting|sidebar|header|tab/i.test(feedback)) score += 20;
    if (/click|tap|find|navigate|tried|looking|wanted|access/i.test(feedback)) score += 20;
    if (/couldn't|can't|hidden|confusing|missing|slow|error|broken|unable/i.test(feedback)) score += 15;
    if (/\d+\s*(min|minute|hour|second)/i.test(feedback)) score += 10;
    if (hasImages) score += 10;
    return Math.min(score, 100);
  })();

  const scoreColor = feedbackScore >= 70 ? 'text-green-400' : feedbackScore >= 40 ? 'text-amber-400' : 'text-gray-500';
  const scoreLabel = feedbackScore >= 70 ? 'Great detail' : feedbackScore >= 40 ? 'Getting there' : 'Needs more detail';

  // Quick-insert suggestions based on what's missing
  const suggestions = [];
  if (feedback.length > 10 && !/tried|wanted|looking|click/i.test(feedback)) {
    suggestions.push("I was trying to...");
  }
  if (feedback.length > 10 && !/couldn't|can't|hidden|unable|missing/i.test(feedback)) {
    suggestions.push("but I couldn't find...");
  }
  if (feedback.length > 20 && !/should|expect|would be better|instead/i.test(feedback)) {
    suggestions.push("I expected to see...");
  }
  if (feedback.length > 30 && !/\d+\s*(min|minute|second|hour)/i.test(feedback)) {
    suggestions.push("It took me about __ minutes");
  }

  return (
    <div className="space-y-4">
      {/* AI Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white">AI Assistant</span>
          <p className="text-[10px] text-gray-500">Helping you write better feedback</p>
        </div>
      </div>

      {/* Feedback quality score */}
      <div className="bg-gray-800/50 rounded-lg p-3">
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
      </div>

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
                __html: nudge.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
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
// Main Page
// ──────────────────────────────────────────────

export default function SubmitFeedback() {
  const { websites, activeWebsiteId } = useWebsites();
  const [submitted, setSubmitted] = useState(false);
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
    websiteId: activeWebsiteId,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSuggestInsert = useCallback((text) => {
    const sep = form.feedback.endsWith(' ') || !form.feedback ? '' : ' ';
    setForm(prev => ({ ...prev, feedback: prev.feedback + sep + text }));
    // Focus textarea after insert
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [form.feedback]);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
        <p className="text-gray-400 mb-6">
          Your feedback has been submitted. Our AI will analyze it alongside other submissions 
          to identify patterns and generate visual solutions.
        </p>
        <button
          onClick={() => { setSubmitted(false); setImages([]); setForm({ name: '', role: 'employee', department: '', rating: 3, feedback: '', category: 'general', websiteId: activeWebsiteId }); }}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-1">Submit Feedback</h1>
      <p className="text-sm text-gray-400 mb-8">
        Your feedback helps us identify issues and build visual solutions. The AI assistant on the right will help you provide the best feedback.
      </p>

      <div className="flex gap-6">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          {/* Which website is this about */}
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
              Severity (1 = Critical, 5 = Minor)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  className={`w-9 h-9 rounded-lg font-medium text-sm transition-all
                    ${form.rating === n
                      ? 'bg-indigo-600 text-white scale-110'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
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
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                       text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
            Submit Feedback
          </button>
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
    </div>
  );
}
