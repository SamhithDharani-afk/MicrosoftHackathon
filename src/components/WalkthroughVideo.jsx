import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Clapperboard, RefreshCw, AlertCircle, Timer, MousePointerClick,
} from 'lucide-react';
import { generateWalkthroughVideo, fetchCachedWalkthroughVideo } from '../utils/api';

// Simulated "customer usage" clip of a proposed change, rendered as an animated GIF.
// The backend applies the fix, then draws a fake cursor gliding to each changed
// control, highlighting it, and "clicking" it — frame by frame — and encodes a GIF.
// A GIF embeds reliably as a plain <img> (no codecs / blob URLs / autoplay quirks).
//
// When a `cacheKey` is supplied the clip is loaded instantly from a server-side GIF
// warmed by `npm run pregen` (falling back to a local cache), so the demo shows the
// simulation immediately without generating it live.
export default function WalkthroughVideo({ websiteId, painPointSummary, fixTitle, fixDescription, cacheKey }) {
  const storageKey = cacheKey ? `feedbackflow_walkthrough_video_v1_${cacheKey}` : null;

  const [gif, setGif] = useState('');
  const [changeCount, setChangeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Restore a previously generated simulation for this pain point: prefer the local
  // cache (instant), then fall back to a server-side GIF warmed by `npm run pregen`
  // so the clip shows up immediately without re-rendering it.
  useEffect(() => {
    if (!storageKey) return undefined;
    let cancelled = false;
    let restored = false;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.gif) {
        setGif(saved.gif);
        setChangeCount(saved.changeCount || 0);
        restored = true;
      }
    } catch {
      // ignore corrupt / unavailable cache
    }
    if (!restored) {
      fetchCachedWalkthroughVideo(cacheKey)
        .then((data) => {
          if (cancelled || !data || !data.gif) return;
          setGif(data.gif);
          setChangeCount(data.changeCount || 0);
          try {
            localStorage.setItem(storageKey, JSON.stringify({ gif: data.gif, changeCount: data.changeCount || 0 }));
          } catch {
            // best-effort: a GIF data URL can exceed the localStorage quota
          }
        })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [storageKey, cacheKey]);

  const handleGenerate = useCallback(async (refresh = false) => {
    if (!websiteId || !fixTitle) return;
    setLoading(true);
    setError('');
    const start = performance.now();
    setElapsedMs(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedMs(performance.now() - start), 100);
    try {
      const data = await generateWalkthroughVideo({ websiteId, painPointSummary, fixTitle, fixDescription, cacheKey, refresh });
      setGif(data.gif);
      setChangeCount(data.changeCount || 0);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify({ gif: data.gif, changeCount: data.changeCount || 0 }));
        } catch {
          // a GIF data URL can exceed the localStorage quota — caching is best-effort
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate the simulation.');
    } finally {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsedMs(performance.now() - start);
      setLoading(false);
    }
  }, [websiteId, painPointSummary, fixTitle, fixDescription, cacheKey, storageKey]);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  // ── Empty state: prompt to generate ──────────────────────────
  if (!gif) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        {error ? (
          <p className="text-sm text-red-400 mb-4 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-1">
            Generate a short, narration-free animation where a simulated cursor finds and
            uses each change on the real redesigned wireframe — like watching a customer try it.
          </p>
        )}
        {loading && (
          <p className="text-xs text-gray-500 mb-4 flex items-center justify-center gap-1.5">
            <Timer className="w-3.5 h-3.5" /> Applying the fix and rendering the animation… {elapsedSec}s
          </p>
        )}
        <button
          type="button"
          onClick={() => handleGenerate(false)}
          disabled={loading}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4" />}
          {loading ? 'Rendering…' : error ? 'Try again' : 'Generate usage simulation'}
        </button>
      </div>
    );
  }

  // ── Player ───────────────────────────────────────────────────
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <img
        src={gif}
        alt="Simulated cursor using the proposed change"
        className="w-full max-h-[460px] bg-black object-contain"
      />
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-800 bg-gray-900/60">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
          Simulated cursor demo{changeCount ? ` · ${changeCount} change${changeCount === 1 ? '' : 's'}` : ''} · loops automatically
        </span>
        <button
          type="button"
          onClick={() => handleGenerate(true)}
          disabled={loading}
          title="Regenerate the simulation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-gray-200 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? `${elapsedSec}s` : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}
