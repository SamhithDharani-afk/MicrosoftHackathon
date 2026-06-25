import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Play, MessageSquare, AlertCircle, Clapperboard } from 'lucide-react';
import { fetchPainPoints, fetchFeedback } from '../utils/api';
import { severityMeta } from '../utils/severity';
import WalkthroughSlideshow from '../components/WalkthroughSlideshow';
import WalkthroughVideo from '../components/WalkthroughVideo';

export default function PainPointDetail() {
  const { id } = useParams();
  const [painPoint, setPainPoint] = useState(undefined); // undefined = loading, null = not found
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPainPoints()
      .then(async (all) => {
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

      <h1 className="text-3xl font-bold text-white mb-4">{painPoint.title}</h1>
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

      {/* Simulated usage video — a fake cursor finds and uses each change */}
      {painPoint.websiteId && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-purple-400" />
            Simulated Usage Video
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Watch a simulated cursor discover and use{' '}
            <span className="text-gray-300">{fix.title}</span> on the redesigned
            wireframe — a narration-free clip that plays like a real customer trying it.
          </p>
          <WalkthroughVideo
            websiteId={painPoint.websiteId}
            painPointSummary={painPoint.summary}
            fixTitle={fix.title}
            fixDescription={fix.description}
          />
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
