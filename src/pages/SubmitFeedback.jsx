import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function SubmitFeedback() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: 'employee',
    department: '',
    rating: 3,
    feedback: '',
    category: 'general',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
          onClick={() => { setSubmitted(false); setForm({ name: '', role: 'employee', department: '', rating: 3, feedback: '', category: 'general' }); }}
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
    </div>
  );
}
