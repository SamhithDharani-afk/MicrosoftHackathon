import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Gauge, MessageSquare, ChevronDown, ChevronRight, Wand2, Image, Workflow, Eye, Sparkles, Globe, GitBranch, Plus } from 'lucide-react';
import { useWebsites } from '../context/WebsitesContext';
import { fetchFeedback, fetchPainPoints } from '../utils/api';
import { severityMeta } from '../utils/severity';

function PainPointCard({ pp, onGenerate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0
            ${pp.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {pp.severity}
          </span>
          <h3 className="text-sm font-semibold text-white truncate">{pp.title}</h3>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
            <span>Impact: <strong className="text-white">{pp.impactScore}</strong></span>
            <span>Mentions: <strong className="text-white">{pp.mentionCount}</strong></span>
          </div>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-6 pb-5 border-t border-gray-800 pt-4 animate-fade-in">
          <p className="text-sm text-gray-400 mb-4">{pp.summary}</p>

          {/* Root Cause — compact */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-5">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Root Cause</p>
            <p className="text-sm text-gray-300">{pp.rootCause}</p>
          </div>

          {/* Generate Solution Button */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(pp, 'wireframe'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                         bg-purple-600 hover:bg-purple-500 text-white transition-all hover:scale-[1.02]
                         shadow-lg shadow-purple-600/20"
            >
              <Image className="w-4 h-4" />
              Generate Wireframe
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(pp, 'process-flow'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                         bg-blue-600 hover:bg-blue-500 text-white transition-all hover:scale-[1.02]
                         shadow-lg shadow-blue-600/20"
            >
              <Workflow className="w-4 h-4" />
              Generate Process Flow
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(pp, 'walkthrough'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                         bg-green-600 hover:bg-green-500 text-white transition-all hover:scale-[1.02]
                         shadow-lg shadow-green-600/20"
            >
              <Eye className="w-4 h-4" />
              Generate Walkthrough
            </button>
          </div>

          {/* Already generated solutions (if any) */}
          {pp.solutions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Previously generated:</p>
              <div className="flex flex-wrap gap-2">
                {pp.solutions.map((sol) => {
                  const getLink = () => {
                    if (sol.type === 'wireframe') return `/wireframe/${sol.id}`;
                    if (sol.type === 'process-flow') return `/process-flow/${sol.id}`;
                    return `/pain-point/${pp.id}`;
                  };
                  return (
                    <Link
                      key={sol.id}
                      to={getLink()}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 
                                 hover:border-indigo-500/50 hover:text-white transition-colors"
                    >
                      {sol.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { websites, activeWebsite, activeWebsiteId, setActiveWebsite } = useWebsites();
  const [generating, setGenerating] = useState(null); // { ppId, type }
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [painPoints, setPainPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pull live feedback + AI-clustered pain points for the selected website.
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([fetchFeedback(activeWebsiteId), fetchPainPoints(activeWebsiteId)])
      .then(([fb, pp]) => {
        if (!active) return;
        setFeedbackEntries(fb);
        setPainPoints(pp);
      })
      .catch(() => {
        if (!active) return;
        setFeedbackEntries([]);
        setPainPoints([]);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeWebsiteId]);

  const totalFeedback = feedbackEntries.length;
  const criticalCount = painPoints.filter(p => p.severity === 'critical').length;
  // Average severity rating (1 = Mild … 5 = Critical) across all feedback.
  const avgSeverity = totalFeedback
    ? feedbackEntries.reduce((sum, f) => sum + (f.rating ?? 3), 0) / totalFeedback
    : 0;
  const avgSeverityMeta = severityMeta(avgSeverity);

  const handleGenerate = (pp, type) => {
    setGenerating({ ppId: pp.id, type });

    // Simulate AI generation delay, then navigate to the result for THIS pain point.
    setTimeout(() => {
      setGenerating(null);
      if (type === 'wireframe') {
        const sol = pp.solutions.find(s => s.type === 'wireframe');
        // A bespoke wireframe renderer currently exists for the Viva Engage example.
        if (sol) navigate(`/wireframe/${sol.id}`);
        else {
          // Fall back to a process flow if this pain point has no wireframe yet.
          const flow = pp.solutions.find(s => s.type === 'process-flow');
          navigate(flow ? `/process-flow/${flow.id}` : `/pain-point/${pp.id}`);
        }
      } else if (type === 'process-flow') {
        const sol = pp.solutions.find(s => s.type === 'process-flow');
        navigate(sol ? `/process-flow/${sol.id}` : `/pain-point/${pp.id}`);
      } else {
        navigate(`/pain-point/${pp.id}`);
      }
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      {/* Generation Overlay */}
      {generating && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-7 h-7 text-indigo-400 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Generating {generating.type.replace('-', ' ')}...</h3>
            <p className="text-sm text-gray-400">AI is analyzing {activeWebsite?.name}'s feedback and building a visual solution</p>
          </div>
        </div>
      )}

      {/* Website switcher — the dashboard reconfigures per selected website */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            Your Websites
          </p>
          <Link
            to="/add-website"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add website
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {websites.map((w) => {
            const isActive = w.id === activeWebsiteId;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWebsite(w.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-white scale-[1.02]'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}
              >
                <span className="text-base leading-none">{w.emoji}</span>
                {w.name}
                {w.repoConnected && (
                  <GitBranch className="w-3 h-3 text-green-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{activeWebsite?.emoji}</span>
            {activeWebsite?.name} Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalFeedback > 0
              ? <>AI-analyzed pain points from {totalFeedback} submissions · <span className="text-gray-400">{activeWebsite?.url}</span></>
              : <>No feedback yet for this website</>}
          </p>
        </div>
        {totalFeedback > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">AI Analysis Complete</span>
          </div>
        )}
      </div>

      {/* Empty state for a freshly added website */}
      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-sm text-gray-500">
          Loading feedback…
        </div>
      ) : totalFeedback === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No feedback for {activeWebsite?.name} yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Once people submit feedback about this website, the AI will cluster it into pain points
            and this dashboard will fill up automatically — independent from your other websites.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Collect feedback
          </Link>
        </div>
      ) : (
        <>
          {/* Stats — compact row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Submissions', value: totalFeedback, icon: MessageSquare, accent: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Pain Points', value: painPoints.length, icon: AlertTriangle, accent: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Critical', value: criticalCount, icon: TrendingUp, accent: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Avg Severity', value: totalFeedback ? `${avgSeverity.toFixed(1)}/5` : '—', icon: Gauge, accent: avgSeverityMeta.text, bg: avgSeverityMeta.bg },
            ].map(({ label, value, icon: Icon, accent, bg }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${accent}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pain Points — collapsible cards */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Top Pain Points · {activeWebsite?.name}
              </h2>
              <span className="text-xs text-gray-500">Click to expand • Generate solutions with one click</span>
            </div>
            <div className="space-y-3">
              {painPoints.map((pp) => (
                <PainPointCard key={pp.id} pp={pp} onGenerate={handleGenerate} />
              ))}
            </div>
          </section>

          {/* Recent Feedback — cleaner table */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Recent Submissions
            </h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Who</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Feedback</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackEntries.map((fb) => (
                    <tr key={fb.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                      <td className="px-5 py-3">
                        <span className="text-white font-medium">{fb.submitter}</span>
                        <span className="text-gray-500 text-xs ml-1.5">({fb.role})</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityMeta(fb.rating).badge}`}>
                          {fb.rating}/5 · {severityMeta(fb.rating).label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-300 max-w-lg truncate">{fb.text}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{fb.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
