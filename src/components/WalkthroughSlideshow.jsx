import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, ChevronLeft, ChevronRight, Sparkles, RefreshCw, AlertCircle, Timer,
} from 'lucide-react';
import { generateWalkthrough } from '../utils/api';

// Step-by-step slideshow of a proposed change. The slides are PNGs the backend
// captures with Playwright from the freshly generated "after" wireframe — a clean
// overview, then a "find it" / "use it" pair per change — so the walkthrough shows
// the real redesign, not a hand-drawn mock.
export default function WalkthroughSlideshow({ websiteId, painPointSummary, fixTitle, fixDescription, cacheKey }) {
  const storageKey = cacheKey ? `feedbackflow_walkthrough_v1_${cacheKey}` : null;

  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const timerRef = useRef(null);
  const autoplayRef = useRef(null);

  // Restore a previously generated slideshow for this pain point.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setSlides(parsed);
          setCurrent(0);
        }
      }
    } catch {
      // ignore corrupt / unavailable cache
    }
  }, [storageKey]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(autoplayRef.current);
  }, []);

  const go = useCallback((dir) => {
    if (slides.length) setCurrent((c) => (c + dir + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay: advance every 3.2s while playing.
  useEffect(() => {
    clearInterval(autoplayRef.current);
    if (!playing || slides.length < 2) return undefined;
    autoplayRef.current = setInterval(() => go(1), 3200);
    return () => clearInterval(autoplayRef.current);
  }, [playing, slides.length, go]);

  const handleGenerate = useCallback(async () => {
    if (!websiteId || !fixTitle) return;
    setLoading(true);
    setError('');
    setPlaying(false);
    const start = performance.now();
    setElapsedMs(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedMs(performance.now() - start), 100);
    try {
      const data = await generateWalkthrough({ websiteId, painPointSummary, fixTitle, fixDescription });
      setSlides(data.slides);
      setCurrent(0);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.slides));
        } catch {
          // slideshow PNGs can exceed the localStorage quota — caching is best-effort
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate the walkthrough.');
    } finally {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsedMs(performance.now() - start);
      setLoading(false);
    }
  }, [websiteId, painPointSummary, fixTitle, fixDescription, storageKey]);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);
  const hasSlides = slides.length > 0;
  const slide = hasSlides ? slides[Math.min(current, slides.length - 1)] : null;

  // ── Empty state: prompt to generate ──────────────────────────
  if (!hasSlides) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        {error ? (
          <p className="text-sm text-red-400 mb-4 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-1">
            Generate a slideshow that walks through the proposed change, step by step,
            using the real redesigned wireframe.
          </p>
        )}
        {loading && (
          <p className="text-xs text-gray-500 mb-4 flex items-center justify-center gap-1.5">
            <Timer className="w-3.5 h-3.5" /> Applying the fix and capturing slides… {elapsedSec}s
          </p>
        )}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : error ? 'Try again' : 'Generate slideshow walkthrough'}
        </button>
      </div>
    );
  }

  // ── Slideshow ────────────────────────────────────────────────
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Stage */}
      <div className="relative bg-black/40">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full max-h-[460px] object-contain bg-[#1f1f1f]"
        />

        {/* Prev / Next */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => { setPlaying(false); go(-1); }}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => { setPlaying(false); go(1); }}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Step badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
          {current + 1} / {slides.length}
        </span>
      </div>

      {/* Caption */}
      <div className="p-5 border-t border-gray-800">
        <h3 className="text-white font-semibold mb-1.5">{slide.title}</h3>
        <p className="text-sm text-gray-400">{slide.caption}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-gray-800 bg-gray-900/60">
        <div className="flex items-center gap-2">
          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {playing ? 'Pause' : 'Play'}
            </button>
          )}
          {/* Dots */}
          <div className="flex items-center gap-1.5 ml-1">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => { setPlaying(false); setCurrent(i); }}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-5 bg-green-400' : 'w-2 bg-gray-600 hover:bg-gray-500'}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          title="Regenerate the walkthrough"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-gray-200 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? `${elapsedSec}s` : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}
