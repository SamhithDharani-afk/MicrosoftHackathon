import { useState } from 'react';
import { Send, CheckCircle2, Upload, X } from 'lucide-react';
import { submitFeedback } from '../api';

const initialForm = {
  name: '',
  role: 'employee',
  department: '',
  url: '',
  frequency: 'first-time',
  rating: 3,
  feedback: '',
  category: 'general',
  suggestedFix: '',
};

export default function SubmitFeedback() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [attachment, setAttachment] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setAttachment({ file, url });
  };

  const removeAttachment = () => {
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    setAttachment(null);
  };

  const resetForm = () => {
    setForm(initialForm);
    removeAttachment();
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback(form, attachment?.file);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() => { setSubmitted(false); resetForm(); }}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-2">Submit Feedback</h1>
      <p className="text-gray-400 mb-8">
        Your feedback helps us identify issues and build visual solutions. Be specific about what's not working.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="Engineering, Marketing, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
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

        {/* URL & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Page URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="https://engage.cloud.microsoft/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">How often does this happen?</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                         focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="first-time">First time</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
              <option value="every-time">Every time</option>
            </select>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Severity (1 = Critical, 5 = Minor)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm({ ...form, rating: n })}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all
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
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Describe the issue in detail
          </label>
          <textarea
            required
            rows={5}
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 
                       transition-colors resize-none"
            placeholder="Be specific: What were you trying to do? What happened? What did you expect? How long did it take?"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Mention specific UI elements, pages, or workflows for better AI analysis.
          </p>
        </div>

        {/* Screenshot / Attachment */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Screenshot or attachment <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          {attachment ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
              {attachment.url ? (
                <img src={attachment.url} alt="Attachment preview" className="w-16 h-16 rounded-md object-cover border border-gray-700" />
              ) : (
                <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{attachment.file.name}</p>
                <p className="text-xs text-gray-500">{(attachment.file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-gray-700
                              bg-gray-800/50 cursor-pointer hover:border-indigo-500 hover:bg-gray-800 transition-colors text-center">
              <Upload className="w-6 h-6 text-gray-500" />
              <span className="text-sm text-gray-400">Click to upload a screenshot or file</span>
              <span className="text-xs text-gray-600">PNG, JPG, or PDF up to 10MB</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* What would fix this */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            What would fix this for you? <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={form.suggestedFix}
            onChange={(e) => setForm({ ...form, suggestedFix: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30
                       transition-colors resize-none"
            placeholder="e.g., Add a visible gear icon in the top-right corner"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your suggested fix feeds our AI's solution generation.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                     text-white font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/20
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
