import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowLeft, Play, MessageSquare, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { fetchPainPoints, fetchFeedback, generateWalkthrough } from '../utils/api';
import { severityMeta } from '../utils/severity';
import RefineBox from '../components/RefineBox';
import DevPromptButton from '../components/DevPromptButton';
import WalkthroughSlideshow from '../components/WalkthroughSlideshow';

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

  const statePainPoint = location.state?.painPoint;
  const stateWebsiteId = location.state?.website?.id;

  useEffect(() => {
    let active = true;

    const hydrate = async (pp) => {
      if (!active) return;
      setPainPoint(pp);
      if (pp) {
        const fb = await fetchFeedback(pp.websiteId).catch(() => []);
        if (active) setRelated(fb.filter((f) => pp.relatedFeedback?.includes(f.id)));
      }
    };

    // Prefer the pain point passed via navigation state. Dynamic, per-website
    // pain points (e.g. ms-support's) only exist in that website's analysis, so a
    // websiteId-less fetch wouldn't find them — hence "Pain point not found".
    if (statePainPoint && statePainPoint.id === id) {
      hydrate(statePainPoint);
      return () => { active = false; };
    }

    fetchPainPoints(stateWebsiteId)
      .then(({ painPoints: all }) => hydrate(all.find((p) => p.id === id) || null))
      .catch(() => active && setPainPoint(null));
    return () => { active = false; };
  }, [id, statePainPoint, stateWebsiteId]);

  // When arriving from the dashboard "Generate Walkthrough" button, auto-generate
  // for pain points that don't have a curated walkthrough.
  useEffect(() => {
    if (!painPoint || autoRef.current) return;
    const curatedWalk = painPoint.solutions?.find((s) => s.type === 'walkthrough');
    if (wantGenerate && !curatedWalk && !painPoint.websiteId) {
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

  // Build the change to walk through. Prefer a real solution (wireframe > walkthrough
  // > first); for auto-clustered pain points that have no solutions yet, synthesize a
  // fix from the pain point itself so the slideshow still works.
  const fixSolution =
    painPoint.solutions?.find((s) => s.type === 'wireframe') ||
    painPoint.solutions?.find((s) => s.type === 'walkthrough') ||
    painPoint.solutions?.[0] ||
    null;
  const fix = fixSolution
    ? { title: fixSolution.title, description: fixSolution.description, key: fixSolution.id }
    : {
        title: `Make “${painPoint.title}” easy to discover and use`,
        description: `Address this user pain point by surfacing the relevant control where users expect it and making the action obvious. Context: ${painPoint.summary || painPoint.rootCause || ''}`,
        key: 'auto',
      };

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

      {/* Slideshow walkthrough — generated from the real redesigned wireframe */}
      {painPoint.websiteId && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Slideshow Walkthrough
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Step through <span className="text-gray-300">{fix.title}</span> on the real
            redesigned wireframe — captured straight from the proposed design.
          </p>
          <WalkthroughSlideshow
            websiteId={painPoint.websiteId}
            painPointSummary={painPoint.summary}
            fixTitle={fix.title}
            fixDescription={fix.description}
            cacheKey={`${painPoint.id}_${fix.key}`}
          />
        </section>
      )}

      {/* AI-generated text walkthrough — fallback for pain points with no website. */}
      {!painPoint.websiteId && (
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
