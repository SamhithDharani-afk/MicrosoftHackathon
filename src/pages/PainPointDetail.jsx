import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowLeft, Play, ChevronRight, MessageSquare, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { walkthroughs } from '../data/mockData';
import { fetchPainPoints, fetchFeedback, generateWalkthrough } from '../utils/api';
import { severityMeta } from '../utils/severity';
import RefineBox from '../components/RefineBox';
import DevPromptButton from '../components/DevPromptButton';

export default function PainPointDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [painPoint, setPainPoint] = useState(undefined); // undefined = loading, null = not found
  const [related, setRelated] = useState([]);

  // AI-generated walkthrough (for pain points without a bundled, curated one).
  const wantGenerate = location.state?.generate === 'walkthrough';
  const websiteName = location.state?.website?.name;
  const websiteUrl = location.state?.website?.url;
  const [genWalk, setGenWalk] = useState(null);
  const [walkLoading, setWalkLoading] = useState(false);
  const [walkError, setWalkError] = useState('');
  const autoRef = useRef(false);

  const runWalkthrough = useCallback(
    async (pp, refinement) => {
      if (!pp) return;
      setWalkLoading(true);
      setWalkError('');
      try {
        setGenWalk(await generateWalkthrough(pp, websiteName, refinement));
      } catch (e) {
        setWalkError(e.message || 'Failed to generate walkthrough');
      } finally {
        setWalkLoading(false);
      }
    },
    [websiteName]
  );

  useEffect(() => {
    let active = true;
    fetchPainPoints()
      .then(async ({ painPoints: all }) => {
        const pp = all.find((p) => p.id === id) || null;
        if (!active) return;
        setPainPoint(pp);
        if (pp) {
          const fb = await fetchFeedback(pp.websiteId).catch(() => []);
          if (active) setRelated(fb.filter((f) => pp.relatedFeedback?.includes(f.id)));
        }
      })
      .catch(() => active && setPainPoint(null));
    return () => { active = false; };
  }, [id]);

  // When arriving from the dashboard "Generate Walkthrough" button, auto-generate
  // for pain points that don't have a curated walkthrough.
  useEffect(() => {
    if (!painPoint || autoRef.current) return;
    const curatedWalk = painPoint.solutions?.find((s) => s.type === 'walkthrough');
    if (wantGenerate && !curatedWalk) {
      autoRef.current = true;
      runWalkthrough(painPoint);
    }
  }, [painPoint, wantGenerate, runWalkthrough]);

  if (painPoint === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-500">Loading…</div>
    );
  }

  if (!painPoint) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl text-white">Pain point not found</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  const walkthroughSol = painPoint.solutions?.find((s) => s.type === 'walkthrough');
  const walkthrough = walkthroughSol ? walkthroughs[walkthroughSol.id] : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
          ${painPoint.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {painPoint.severity}
        </span>
        {painPoint.derived && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Auto-clustered from feedback
          </span>
        )}
        <span className="text-xs text-gray-500">
          {painPoint.mentionCount} mention{painPoint.mentionCount === 1 ? '' : 's'} · impact {painPoint.impactScore}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-white">{painPoint.title}</h1>
        <div className="flex-shrink-0 mt-1">
          <DevPromptButton painPoint={painPoint} websiteName={websiteName} url={websiteUrl} />
        </div>
      </div>
      <p className="text-gray-400 mb-6">{painPoint.summary}</p>

      {/* Root cause */}
      {painPoint.rootCause && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Root Cause
          </p>
          <p className="text-sm text-gray-300">{painPoint.rootCause}</p>
        </div>
      )}

      {/* Bespoke visual walkthrough (only for curated pain points) */}
      {walkthrough && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            {walkthrough.title || 'Visual Walkthrough'}
          </h2>

          <div className="space-y-4">
            {walkthrough.steps.map((step, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-green-400">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{step.description}</p>

                    {/* Visual mockup for each step */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      {step.visual === 'header-gear' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-gray-700 rounded px-4 py-2">
                            <span className="text-sm font-medium text-white">Viva Engage</span>
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-indigo-500/30 border-2 border-indigo-400 flex items-center justify-center text-sm pulse-glow">⚙️</span>
                              <span className="text-sm">🔔</span>
                              <span className="w-6 h-6 rounded-full bg-blue-500 text-xs flex items-center justify-center">JD</span>
                            </div>
                          </div>
                          <p className="text-xs text-green-400 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" /> The gear icon is now visible in the header ↑
                          </p>
                        </div>
                      )}
                      {step.visual === 'click-gear' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-gray-700 rounded px-4 py-2">
                            <span className="text-sm font-medium text-white">Viva Engage</span>
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-indigo-300 flex items-center justify-center text-sm animate-bounce">⚙️</span>
                              <span className="text-sm">🔔</span>
                              <span className="w-6 h-6 rounded-full bg-blue-500 text-xs flex items-center justify-center">JD</span>
                            </div>
                          </div>
                          <div className="mt-2 bg-gray-900 border border-indigo-500/50 rounded-lg p-3">
                            <p className="text-xs text-indigo-300 font-medium mb-2">Settings Panel Opens ↓</p>
                            <div className="space-y-1">
                              <div className="h-6 bg-gray-700 rounded w-3/4" />
                              <div className="h-6 bg-gray-700 rounded w-2/3" />
                              <div className="h-6 bg-gray-700 rounded w-4/5" />
                            </div>
                          </div>
                        </div>
                      )}
                      {step.visual === 'settings-categories' && (
                        <div className="grid grid-cols-2 gap-2">
                          {['🔔 Notifications', '🔒 Privacy', '👤 Profile', '🖥 Display', '🌐 Language'].map((cat) => (
                            <div key={cat} className="bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 cursor-pointer transition-colors">
                              {cat}
                            </div>
                          ))}
                        </div>
                      )}
                      {step.visual === 'make-changes' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Email notifications</span>
                            <div className="w-10 h-5 bg-indigo-500 rounded-full relative">
                              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Push notifications</span>
                            <div className="w-10 h-5 bg-gray-600 rounded-full relative">
                              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                            </div>
                          </div>
                          <p className="text-xs text-green-400">✓ Changes saved automatically</p>
                        </div>
                      )}
                      {step.visual === 'sidebar-access' && (
                        <div className="flex gap-4">
                          <div className="w-48 bg-gray-700 rounded-lg p-3 space-y-2">
                            <div className="text-xs text-gray-400 font-medium mb-2">Sidebar</div>
                            <div className="text-sm text-gray-300 py-1">🏠 Home</div>
                            <div className="text-sm text-gray-300 py-1">💬 Communities</div>
                            <div className="text-sm text-gray-300 py-1">📢 Announcements</div>
                            <div className="border-t border-gray-600 my-2" />
                            <div className="text-sm text-indigo-300 py-1 bg-indigo-500/10 rounded px-2 font-medium pulse-glow">⚙️ Settings</div>
                          </div>
                          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                            ← Also accessible from the sidebar
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI-generated walkthrough — for pain points without a curated one. */}
      {!walkthrough && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-green-400" />
              {genWalk?.title || 'Visual Walkthrough'}
            </h2>
            {!genWalk && !walkLoading && (
              <button
                onClick={() => runWalkthrough(painPoint)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Generate walkthrough
              </button>
            )}
          </div>

          {walkLoading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <RefreshCw className="w-7 h-7 text-green-400 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-300">Generating a step-by-step walkthrough of the fix…</p>
            </div>
          ) : walkError ? (
            <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400 mb-3">{walkError}</p>
              <button
                onClick={() => runWalkthrough(painPoint)}
                className="text-sm text-indigo-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : genWalk ? (
            <div className="space-y-4">
              {genWalk.steps.map((step, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-green-400">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              <RefineBox
                accent="green"
                loading={walkLoading}
                onRefine={(note) => runWalkthrough(painPoint, note)}
                placeholder='Describe what to change, e.g. "add a step about the mobile app" or "make it 3 steps"'
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Generate a step-by-step guide showing how the proposed fix solves this pain point.
            </p>
          )}
        </section>
      )}

      {/* Related feedback that formed this cluster */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Feedback in this cluster ({related.length})
        </h2>
        {related.length === 0 ? (
          <p className="text-sm text-gray-500">No matching submissions found.</p>
        ) : (
          <div className="space-y-3">
            {related.map((fb) => (
              <div key={fb.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium text-white">{fb.submitter}</span>
                  <span className="text-xs text-gray-500">({fb.role})</span>
                  {fb.department && <span className="text-xs text-gray-600">· {fb.department}</span>}
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${severityMeta(fb.rating).badge}`}>
                    {fb.rating}/5 · {severityMeta(fb.rating).label}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{fb.text}</p>
                <p className="text-xs text-gray-600 mt-1.5">{fb.date}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
