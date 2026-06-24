import { Link } from 'react-router-dom';
import { MessageSquarePlus, BarChart3, Workflow, ArrowRight, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Feedback Analysis
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Turn Feedback Into
          <br />
          <span className="text-indigo-400">Visual Solutions</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Add your website and our AI captures its UI, then turns user feedback into wireframes,
          process flows, and walkthroughs showing exactly how to fix the biggest pain points.
          Track multiple websites — each gets its own dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/add-website"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
          >
            <Globe className="w-5 h-5" />
            Add Your Website
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-gray-700 hover:border-gray-500 text-white font-semibold transition-all hover:scale-105"
          >
            <BarChart3 className="w-5 h-5" />
            View Dashboards
          </Link>
        </div>
        <p className="text-xs text-gray-600 mt-4">
          Connecting a GitHub repo is optional — add it later for richer, code-aware suggestions.
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Globe, title: 'Add Website', desc: 'Add your live site so the AI learns its real UI for accurate wireframes' },
            { icon: MessageSquarePlus, title: 'Collect', desc: 'Employees & customers submit feedback about that specific website' },
            { icon: BarChart3, title: 'Analyze', desc: 'AI clusters pain points into a dashboard tailored to each website' },
            { icon: Workflow, title: 'Visualize', desc: 'Auto-generates wireframes, process flows & walkthroughs for solutions' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="relative">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
              {i < 3 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-5 h-5 text-gray-600 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Live Example Banner */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">🔥 3 live example websites loaded</h3>
          <p className="text-gray-300 mb-6">
            Explore the dashboards for <strong>Viva Engage</strong>, <strong>Microsoft Teams</strong>, and{' '}
            <strong>Outlook Web</strong>. Each shows the distinct pain points its own users reported —
            from "can't find settings" to "in-call controls disappear" — with AI-generated visual fixes.
            Switch between them right in the dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Submit Feedback
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-gray-600 hover:border-gray-400 text-white text-sm font-medium transition-colors"
            >
              Compare the dashboards
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
