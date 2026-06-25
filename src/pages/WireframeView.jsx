import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, MousePointerClick, Share2, Download, Copy, Link as LinkIcon, Check, Sparkles, RefreshCw, Timer, Maximize2, Minimize2, Locate } from 'lucide-react';
import { wireframes } from '../data/mockData';
import { resolveWireframeContext } from '../utils/wireframeContext';
import { fetchWireframe, generateAfter } from '../utils/api';

function WireframePanel({ type, data, showCallouts = false }) {
  const isAfter = type === 'after';

  return (
    <div className={`rounded-xl border-2 overflow-hidden relative ${isAfter ? 'border-green-500/40' : 'border-red-500/40'}`}>
      {/* Browser chrome */}
      <div className="bg-[#2b2b2b] px-4 py-2 flex items-center gap-2 border-b border-[#404040]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-[#3c3c3c] rounded-full px-3 py-1 text-xs text-gray-400 max-w-sm flex items-center gap-2">
            <span className="text-gray-500">🔒</span> engage.cloud.microsoft/main/feed
          </div>
        </div>
      </div>

      {/* M365 Top Bar — dark navy bar that matches real M365 */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1b1a19]">
        {/* Left: Waffle + App name */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-white/10 rounded">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="6" y="1" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="11" y="1" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="1" y="6" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="6" y="6" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="11" y="6" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="1" y="11" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="6" y="11" width="4" height="4" rx="0.5" fill="#9ca3af"/>
              <rect x="11" y="11" width="4" height="4" rx="0.5" fill="#9ca3af"/>
            </svg>
          </div>
          <span className="text-sm text-white font-normal">Engage</span>
        </div>
        {/* Center: Search bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="bg-[#3c3c3c] rounded-md px-3 py-1.5 flex items-center gap-2">
            <span className="text-gray-500 text-xs">🔍</span>
            <span className="text-xs text-gray-500">Search Engage</span>
          </div>
        </div>
        {/* Right: Icons */}
        <div className="flex items-center gap-1">
          {isAfter && (
            <div className="relative group">
              <div className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer bg-indigo-500/20 border border-indigo-400 pulse-glow">
                <span className="text-sm">⚙️</span>
              </div>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-indigo-600 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                Settings
              </div>
              {/* Red callout arrow */}
              {showCallouts && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none">
                  <div className="text-red-400 text-lg leading-none">↑</div>
                  <div className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded whitespace-nowrap shadow-lg">
                    NEW
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer hover:bg-white/10">
            <span className="text-sm">🔔</span>
          </div>
          <div className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer hover:bg-white/10">
            <span className="text-xs">💬</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#7c4dff] flex items-center justify-center text-[10px] font-semibold text-white ml-1 cursor-pointer">
            JD
          </div>
        </div>
      </div>

      {/* Main body */}
      <div className="flex bg-[#1f1f1f] min-h-[420px]">
        {/* Left Sidebar — matches real Viva Engage nav */}
        <div className="w-56 border-r border-[#333] bg-[#1f1f1f] p-2 space-y-0.5 hidden md:flex flex-col">
          <div className="px-3 py-2 rounded-md text-xs text-white bg-[#333] font-medium flex items-center gap-2.5">
            <span className="w-4 text-center">🏠</span> Home
          </div>
          <div className="px-3 py-2 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <span className="w-4 text-center">📢</span> Storyline
          </div>
          <div className="px-3 py-2 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <span className="w-4 text-center">💬</span> Communities
          </div>
          <div className="px-3 py-2 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <span className="w-4 text-center">📥</span> Inbox
          </div>
          <div className="px-3 py-2 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <span className="w-4 text-center">🔖</span> Bookmarks
          </div>

          {/* Separator */}
          <div className="border-t border-[#333] my-2" />

          <div className="px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider">Communities</div>
          <div className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[8px] text-white">A</div>
            All Company
          </div>
          <div className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <div className="w-4 h-4 rounded bg-green-600 flex items-center justify-center text-[8px] text-white">E</div>
            Engineering
          </div>
          <div className="px-3 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2a2a2a] flex items-center gap-2.5 cursor-pointer">
            <div className="w-4 h-4 rounded bg-orange-600 flex items-center justify-center text-[8px] text-white">H</div>
            HR Updates
          </div>

          {/* Spacer to push settings to bottom */}
          <div className="flex-1" />

          {/* Settings — ONLY in "after" */}
          {isAfter && (
            <div className="border-t border-[#333] pt-2 relative">
              <div className="px-3 py-2 rounded-md text-xs text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 font-medium flex items-center gap-2.5 cursor-pointer pulse-glow">
                <span className="w-4 text-center">⚙️</span> Settings
              </div>
              {/* Red callout arrow */}
              {showCallouts && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-16 flex items-center gap-0.5 z-20 pointer-events-none">
                  <div className="text-red-400 text-lg leading-none">←</div>
                  <div className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded whitespace-nowrap shadow-lg">
                    NEW
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Feed */}
        <div className="flex-1 max-w-xl mx-auto p-4 space-y-3">
          {/* Post composer */}
          <div className="bg-[#292929] rounded-lg border border-[#3a3a3a] p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7c4dff] flex items-center justify-center text-[10px] font-semibold text-white">JD</div>
              <div className="flex-1 bg-[#3a3a3a] rounded-full px-4 py-2 text-xs text-gray-500 cursor-text">
                Start a conversation...
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 pl-11">
              <span className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300">📷 Photo</span>
              <span className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300">📎 File</span>
              <span className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300">📊 Poll</span>
              <span className="text-[10px] text-gray-500 cursor-pointer hover:text-gray-300">🎉 Praise</span>
            </div>
          </div>

          {/* Feed posts */}
          <div className="bg-[#292929] rounded-lg border border-[#3a3a3a] p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">AJ</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">Alex Johnson</span>
                  <span className="text-[10px] text-gray-500">in All Company • 2h</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">Great Q2 results everyone! 🎉 Let's keep the momentum going into the second half of the year.</p>
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[#3a3a3a]">
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">👍 12</span>
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">💬 Reply</span>
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">↗️ Share</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#292929] rounded-lg border border-[#3a3a3a] p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">MP</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">Maya Patel</span>
                  <span className="text-[10px] text-gray-500">in Engineering • 5h</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">Heads up — deployment window for the new auth service is this Friday 4-6pm PST. Please review the runbook.</p>
                <div className="h-14 bg-[#3a3a3a] rounded mt-2 flex items-center px-3">
                  <span className="text-[10px] text-gray-500">📄 deployment-runbook-v2.pdf</span>
                </div>
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[#3a3a3a]">
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">👍 8</span>
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">💬 3 replies</span>
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">↗️ Share</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#292929] rounded-lg border border-[#3a3a3a] p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">SL</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">Sam Lee</span>
                  <span className="text-[10px] text-gray-500">in HR Updates • 1d</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">Reminder: Open enrollment closes next Friday. Please update your benefits selections.</p>
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[#3a3a3a]">
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">👍 24</span>
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">💬 5 replies</span>
                  <span className="text-[10px] text-gray-500 cursor-pointer hover:text-blue-400">↗️ Share</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — trending/info */}
        <div className="w-48 border-l border-[#333] p-3 space-y-3 hidden lg:block">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Trending</div>
          <div className="space-y-2">
            <div className="text-xs text-gray-400 cursor-pointer hover:text-white">#Q2Results</div>
            <div className="text-xs text-gray-400 cursor-pointer hover:text-white">#NewHires</div>
            <div className="text-xs text-gray-400 cursor-pointer hover:text-white">#CompanyEvent</div>
          </div>
          <div className="border-t border-[#333] pt-3 mt-3">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">Suggested</div>
            <div className="text-xs text-blue-400 cursor-pointer hover:underline">+ Join Design Team</div>
          </div>
        </div>
      </div>

      {/* Annotation bar */}
      <div className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${isAfter ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
        {isAfter ? (
          <>
            <span>✅</span>
            <span>Settings now accessible via header gear icon (top-right) and sidebar (bottom-left) — 1 click from anywhere</span>
          </>
        ) : (
          <>
            <span>❌</span>
            <span>Settings hidden inside profile avatar dropdown → requires clicking avatar → finding "Settings" in menu → 3+ clicks, easily missed</span>
          </>
        )}
      </div>
    </div>
  );
}

// Make a generated page safe to preview: strip href/target off every <a> so a
// click never navigates the iframe to a (broken/empty) destination. The pages are
// static previews, not a live site. Forms are neutralized by the empty sandbox.
function neutralizeLinks(rawHtml) {
  if (!rawHtml) return rawHtml;
  return rawHtml.replace(/<a\b([^>]*)>/gi, (_m, attrs) => {
    const cleaned = attrs
      .replace(/\shref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/\starget\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    return `<a${cleaned} data-preview-link>`;
  });
}

// CSS injected INTO the generated "after" document so the changed element — tagged
// by the model with data-ff-new="true" — is highlighted prominently. A red outline +
// pulsing glow marks the element, and a large red arrow (drawn with clip-path) sits
// below it pointing straight up, gently bobbing toward the change, with a bold "NEW"
// badge beneath the arrow that bobs in sync. Placing it below (arrow up) keeps the
// marker visible even for top-bar changes. It lives inside the iframe so it sits
// exactly on the change and scales with the page.
const CHANGE_MARKER_STYLE =
  '<style id="ff-change-markers">' +
  '@keyframes ffPulse{0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,.18)}' +
  '50%{box-shadow:0 0 0 11px rgba(239,68,68,.28)}}' +
  '@keyframes ffBob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,6px)}}' +
  '[data-ff-new]{position:relative !important;outline:3px solid #ef4444 !important;' +
  'outline-offset:3px !important;border-radius:6px !important;' +
  'animation:ffPulse 1.6s ease-in-out infinite !important;}' +
  '[data-ff-new]::after{content:"";position:absolute;top:calc(100% + 6px);' +
  'left:50%;transform:translateX(-50%);width:30px;height:108px;background:#ef4444;' +
  'clip-path:polygon(50% 0,100% 34%,60% 34%,60% 100%,40% 100%,40% 34%,0 34%);' +
  'filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));' +
  'animation:ffBob 1.4s ease-in-out infinite;' +
  'z-index:2147483647;pointer-events:none;}' +
  '[data-ff-new]::before{content:"NEW";position:absolute;top:calc(100% + 122px);' +
  'left:50%;transform:translateX(-50%);color:#fff;background:#ef4444;' +
  'border-radius:7px;padding:6px 13px;box-shadow:0 5px 14px rgba(239,68,68,.4);' +
  'font:800 15px/1 ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:.1em;' +
  'animation:ffBob 1.4s ease-in-out infinite;' +
  'z-index:2147483647;pointer-events:none;white-space:nowrap;}' +
  '</style>';

// Insert the marker CSS into a generated document (before </head>, else after <body>,
// else prepend). Only used for the "after" frame.
function injectChangeMarkers(rawHtml) {
  if (!rawHtml) return rawHtml;
  if (/<\/head>/i.test(rawHtml)) return rawHtml.replace(/<\/head>/i, `${CHANGE_MARKER_STYLE}</head>`);
  if (/<body[^>]*>/i.test(rawHtml)) return rawHtml.replace(/(<body[^>]*>)/i, `$1${CHANGE_MARKER_STYLE}`);
  return CHANGE_MARKER_STYLE + rawHtml;
}

// The natural design width/height the generated pages target (matches the
// screenshot viewport used on the server). We render the iframe at this fixed size
// and CSS-scale it so the whole page fits the column (zoom out), while still letting
// the user scroll around at actual size.
const DESIGN_W = 1280;
const DESIGN_H = 900;

// Renders a Copilot-generated wireframe (raw HTML) inside a sandboxed iframe,
// wrapped in browser chrome so it reads as a "page". Supports fit-to-width (zoom
// out to see everything) and actual-size (scroll around) modes.
function GeneratedFrame({ html, kind, url }) {
  const isAfter = kind === 'after';
  const wrapRef = useRef(null);
  const iframeRef = useRef(null);
  const changeIdxRef = useRef(0);
  const showIdxRef = useRef(0);
  const [fitWidth, setFitWidth] = useState(true);
  const [autoScale, setAutoScale] = useState(1);
  const [focusScale, setFocusScale] = useState(null);
  const [focusTick, setFocusTick] = useState(0);
  const [changeCount, setChangeCount] = useState(0);

  // Effective zoom: a manual "focus" zoom (set when jumping to a change) wins,
  // otherwise fit-to-width (zoom out) or actual size.
  const scale = focusScale != null ? focusScale : fitWidth ? autoScale : 1;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  // Track the fit-to-width ratio as the column resizes.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => setAutoScale(Math.min(1, el.clientWidth / DESIGN_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasChange = isAfter && /data-ff-new/i.test(html || '');
  const safeHtml = useMemo(() => {
    const linksSafe = neutralizeLinks(html);
    return isAfter ? injectChangeMarkers(linksSafe) : linksSafe;
  }, [html, isAfter]);

  // Read the change-marked elements out of the (same-origin) iframe document.
  const readChanges = useCallback(() => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return [];
      return Array.from(doc.querySelectorAll('[data-ff-new]'));
    } catch {
      return [];
    }
  }, []);

  // Once the frame loads, count the changes so we can offer a "View changes" jump.
  const handleIframeLoad = useCallback(() => {
    if (!isAfter) {
      setChangeCount(0);
      return;
    }
    changeIdxRef.current = 0;
    setChangeCount(readChanges().length);
  }, [isAfter, readChanges]);

  // "View change": zoom in on the next change and center its arrow. We bump the zoom
  // (focusScale) and a tick; a layout effect then scrolls once the new scale is live.
  const viewNextChange = useCallback(() => {
    const els = readChanges();
    if (!els.length) return;
    const idx = changeIdxRef.current % els.length;
    showIdxRef.current = idx;
    changeIdxRef.current = idx + 1;
    setFitWidth(false);
    setFocusScale(1.6);
    setFocusTick((t) => t + 1);
  }, [readChanges]);

  // After the focus zoom is applied, scroll the zoomed frame so the change is
  // centered, then flash it. Runs whenever a "View change" click bumps focusTick.
  useEffect(() => {
    if (!focusTick) return;
    const els = readChanges();
    const wrap = wrapRef.current;
    if (!els.length || !wrap) return;
    const el = els[showIdxRef.current % els.length];
    const r = el.getBoundingClientRect();
    const s = scaleRef.current;
    const centerX = (r.left + r.width / 2) * s;
    const centerY = (r.top + r.height / 2) * s;
    wrap.scrollTo({
      left: Math.max(0, centerX - wrap.clientWidth / 2),
      top: Math.max(0, centerY - wrap.clientHeight / 2 + 90 * s),
      behavior: 'smooth',
    });
    try {
      el.animate(
        [
          { boxShadow: '0 0 0 6px rgba(239,68,68,.6)' },
          { boxShadow: '0 0 0 20px rgba(239,68,68,0)' },
        ],
        { duration: 900, iterations: 2 },
      );
    } catch {
      /* WAAPI not critical */
    }
  }, [focusTick, readChanges]);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isAfter ? 'border-green-500/40' : 'border-red-500/40'}`}>
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 mx-3 min-w-0">
          <div className="bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 truncate">
            {url || (isAfter ? 'proposed wireframe' : 'current wireframe')}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setFocusScale(null);
            setFitWidth((f) => !f);
          }}
          title={fitWidth ? 'Switch to actual size (scroll around)' : 'Fit to width (zoom out)'}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          {fitWidth && focusScale == null ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          {fitWidth && focusScale == null ? 'Actual size' : 'Fit width'}
        </button>
      </div>
      <div ref={wrapRef} className="overflow-auto bg-white" style={{ height: 460 }}>
        <div style={{ width: DESIGN_W * scale, height: DESIGN_H * scale }}>
          <iframe
            title={`${kind} wireframe`}
            ref={iframeRef}
            onLoad={handleIframeLoad}
            srcDoc={safeHtml}
            sandbox={isAfter ? 'allow-same-origin' : ''}
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>
      <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 flex-wrap ${isAfter ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
        <span>{isAfter ? '✅ Proposed wireframe — fix applied' : '❌ Current wireframe — generated from the live page'}</span>
        {hasChange && (
          <span className="inline-flex items-center gap-1.5 text-red-400">
            <span className="inline-block w-3 h-3 rounded-sm border-2 border-red-500" />
            red outline + “NEW ▲” arrow marks the change
          </span>
        )}
      </div>
      {isAfter && changeCount > 0 && (
        <div className="bg-gray-900 px-4 py-2.5 border-t border-gray-700 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            {changeCount === 1 ? '1 change in this design' : `${changeCount} changes in this design`}
            {changeCount > 1 && focusTick > 0 && (
              <span className="text-gray-500"> · showing {((showIdxRef.current % changeCount) + 1)}/{changeCount}</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {focusScale != null && (
              <button
                type="button"
                onClick={() => {
                  setFocusScale(null);
                  setFitWidth(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Reset zoom
              </button>
            )}
            <button
              type="button"
              onClick={viewNextChange}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors"
            >
              <Locate className="w-3.5 h-3.5" />
              {changeCount > 1 ? (focusTick > 0 ? 'Next change' : 'View changes') : 'View change'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WireframeView() {
  const { id } = useParams();
  // Dashboards are keyed by website now, so a solution id resolves to its website,
  // live URL and fix metadata — no URL input needed.
  const ctx = useMemo(() => resolveWireframeContext(id), [id]);
  const staticWireframe = wireframes[id]; // optional curated fallback / annotations

  const [view, setView] = useState('comparison'); // 'comparison', 'before', 'after'
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-generated "before" (loads on mount) + on-the-fly "after" (Generate click).
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [beforeLoading, setBeforeLoading] = useState(false);
  const [beforeError, setBeforeError] = useState('');
  const [afterLoading, setAfterLoading] = useState(false);
  const [afterError, setAfterError] = useState('');

  // Live elapsed-time timer for the on-the-fly generation (ms).
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => () => clearInterval(timerRef.current), []);

  const afterCacheKey = `feedbackflow_wireframe_after_v2_${id}`;

  // Load the pre-generated "before" for this website (cached server-side per URL),
  // plus any previously generated "after" from localStorage.
  useEffect(() => {
    if (!ctx) return;
    let active = true;
    try {
      const cachedAfter = localStorage.getItem(afterCacheKey);
      if (cachedAfter) setAfter(cachedAfter);
    } catch {
      // ignore
    }
    setBeforeLoading(true);
    setBeforeError('');
    fetchWireframe(ctx.websiteId, ctx.url)
      .then((data) => {
        if (active) setBefore(data.before || '');
      })
      .catch((err) => {
        if (active) setBeforeError(err.message || 'Failed to load the current design.');
      })
      .finally(() => {
        if (active) setBeforeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ctx, afterCacheKey]);

  const handleGenerate = useCallback(async () => {
    if (!ctx) return;
    setAfterLoading(true);
    setAfterError('');
    const start = performance.now();
    setElapsedMs(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedMs(performance.now() - start), 100);
    try {
      const data = await generateAfter({
        websiteId: ctx.websiteId,
        url: ctx.url,
        painPointSummary: ctx.painPointSummary,
        fixTitle: ctx.title,
        fixDescription: ctx.description,
      });
      if (data.before) setBefore(data.before);
      setAfter(data.after || '');
      try {
        if (data.after) localStorage.setItem(afterCacheKey, data.after);
      } catch {
        // localStorage may be full / unavailable — non-fatal
      }
      setView('comparison');
    } catch (err) {
      setAfterError(err.message || 'Failed to generate the proposed design.');
    } finally {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsedMs(performance.now() - start);
      setAfterLoading(false);
    }
  }, [ctx, afterCacheKey]);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);
  const hasAfter = !!after;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPNG = () => {
    alert('Exporting wireframe as PNG... (In production, this uses html2canvas to capture the wireframe)');
  };

  const handleShareTeams = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this wireframe: ${ctx?.title || ''}`);
    window.open(`https://teams.microsoft.com/share?href=${url}&preview=true&msgText=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Wireframe: ${ctx?.title || ''}`);
    const body = encodeURIComponent(`Hi team,\n\nCheck out this proposed design solution:\n\n${ctx?.title || ''}\n${ctx?.description || ''}\n\nView it here: ${window.location.href}\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!ctx) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl text-white">Wireframe not found</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  // Before panel: generated frame when available, else the curated mock / states.
  const renderBefore = () => {
    if (before) return <GeneratedFrame html={before} kind="before" url={ctx.url} />;
    if (beforeLoading) {
      return (
        <div className="rounded-xl border-2 border-red-500/30 bg-gray-900 h-[300px] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-7 h-7 text-red-400/80 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-gray-300">Reproducing the current design…</p>
          </div>
        </div>
      );
    }
    if (staticWireframe) return <WireframePanel type="before" data={staticWireframe.before} />;
    return (
      <div className="rounded-xl border-2 border-red-500/30 bg-gray-900 h-[300px] flex items-center justify-center text-sm text-gray-500 px-6 text-center">
        {beforeError || 'No current design available yet.'}
      </div>
    );
  };

  // After panel: generated frame when available, else a prompt to generate.
  const renderAfter = () => {
    if (after) return <GeneratedFrame html={after} kind="after" url={ctx.url} />;
    if (afterLoading) {
      return (
        <div className="rounded-xl border-2 border-green-500/30 bg-gray-900 h-[300px] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-7 h-7 text-green-400/80 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-gray-300">Applying the proposed fix…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-xl border-2 border-dashed border-green-500/30 bg-gray-900 h-[300px] flex items-center justify-center px-6 text-center">
        <div>
          <Sparkles className="w-7 h-7 text-green-400/70 mx-auto mb-3" />
          <p className="text-sm text-gray-300 mb-1">Click <span className="font-medium text-white">Generate</span> to apply the proposed fix</p>
          <p className="text-xs text-gray-500">Copilot edits the current design to add the change — on the fly</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{ctx.title}</h1>
          <p className="text-sm text-gray-400">{ctx.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* Generate (apply the fix on the fly) */}
          <button
            onClick={handleGenerate}
            disabled={afterLoading || beforeLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {afterLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {afterLoading ? 'Generating…' : hasAfter ? 'Regenerate' : 'Generate'}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
            {[
              { id: 'comparison', label: 'Compare' },
              { id: 'before', label: 'Before' },
              { id: 'after', label: 'After' },
            ].map(({ id: vid, label }) => (
              <button
                key={vid}
                onClick={() => setView(vid)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${view === vid ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Share/Export */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <button
                    onClick={handleShareTeams}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Share to Teams
                  </button>
                  <button
                    onClick={handleShareEmail}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left"
                  >
                    <Share2 className="w-4 h-4" />
                    Share via Email
                  </button>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={handleExportPNG}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left"
                  >
                    <Download className="w-4 h-4" />
                    Export as PNG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generation error (if the on-the-fly fix failed) */}
      {afterError && (
        <div className="mb-6 flex items-start gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Could not generate the proposed design</p>
            <p className="text-red-400/80 mt-0.5">{afterError}</p>
            <p className="text-gray-500 mt-1">
              Make sure the backend is running: <code className="text-indigo-300 bg-gray-800 px-1.5 py-0.5 rounded">npm run dev</code>
            </p>
          </div>
        </div>
      )}

      {/* Lightweight elapsed-time timer pinned to the window corner while generating */}
      {afterLoading && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-lg border border-white/10 bg-gray-900/50 px-2.5 py-1 text-xs font-medium tabular-nums text-gray-300 shadow-lg backdrop-blur-sm pointer-events-none">
          <Timer className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          {elapsedSec}s
        </div>
      )}

      {/* Wireframe display */}
      {view === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Current (Problem)</span>
            </div>
            {renderBefore()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Proposed (Solution)</span>
            </div>
            {renderAfter()}
          </div>
        </div>
      )}

      {view === 'before' && <div className="max-w-3xl mx-auto mb-8">{renderBefore()}</div>}
      {view === 'after' && <div className="max-w-3xl mx-auto mb-8">{renderAfter()}</div>}

      {/* Design annotations (curated context, when available) */}
      {staticWireframe?.annotations && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-indigo-400" />
            Design Changes Applied
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {staticWireframe.annotations.map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
