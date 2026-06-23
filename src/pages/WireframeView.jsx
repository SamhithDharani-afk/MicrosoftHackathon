import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, MousePointerClick, Share2, Download, Copy, Link as LinkIcon, Check } from 'lucide-react';
import { wireframes } from '../data/mockData';

function WireframePanel({ type, data }) {
  const isAfter = type === 'after';

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isAfter ? 'border-green-500/40' : 'border-red-500/40'}`}>
      {/* Browser chrome mockup */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs">
            engage.microsoft.com/feed
          </div>
        </div>
      </div>

      {/* App content */}
      <div className="bg-gray-900 min-h-[400px]">
        {/* Viva Engage Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">V</span>
            </div>
            <span className="text-sm font-semibold text-white">Viva Engage</span>
            <div className="hidden sm:flex items-center ml-4 gap-1">
              <div className="px-2.5 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-700">Home</div>
              <div className="px-2.5 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-700">Communities</div>
              <div className="px-2.5 py-1 rounded-md text-xs text-gray-400 hover:bg-gray-700">Storyline</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* THE KEY CHANGE: Gear icon visibility */}
            {isAfter ? (
              <div className="relative group">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center cursor-pointer hover:bg-indigo-500/30 transition-colors pulse-glow">
                  <span className="text-sm">⚙️</span>
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-indigo-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                  Settings
                </div>
              </div>
            ) : null}
            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm cursor-pointer">🔍</div>
            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm cursor-pointer">🔔</div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white cursor-pointer">JD</div>
          </div>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-52 border-r border-gray-800 p-3 space-y-1 hidden md:block min-h-[340px] flex flex-col">
            <div className="px-3 py-2 rounded-lg text-xs text-white bg-gray-800 font-medium">🏠 Home</div>
            <div className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800/50">💬 Communities</div>
            <div className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800/50">📢 Announcements</div>
            <div className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800/50">👥 People</div>
            <div className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800/50">📊 Analytics</div>
            
            {/* Settings in sidebar for "after" */}
            {isAfter && (
              <>
                <div className="flex-1" />
                <div className="border-t border-gray-800 pt-2 mt-auto">
                  <div className="px-3 py-2 rounded-lg text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 font-medium pulse-glow">
                    ⚙️ Settings
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Feed content area */}
          <div className="flex-1 p-4 space-y-3">
            {/* Post cards */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500" />
                <span className="text-xs text-gray-300">Alex Johnson</span>
                <span className="text-xs text-gray-600">• 2h ago</span>
              </div>
              <div className="h-3 bg-gray-700 rounded w-4/5 mb-1.5" />
              <div className="h-3 bg-gray-700 rounded w-3/5" />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-500" />
                <span className="text-xs text-gray-300">Maya Patel</span>
                <span className="text-xs text-gray-600">• 5h ago</span>
              </div>
              <div className="h-3 bg-gray-700 rounded w-full mb-1.5" />
              <div className="h-3 bg-gray-700 rounded w-2/3" />
              <div className="h-16 bg-gray-700/50 rounded mt-3" />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-300">Sam Lee</span>
                <span className="text-xs text-gray-600">• 1d ago</span>
              </div>
              <div className="h-3 bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Annotation bar */}
      <div className={`px-4 py-2.5 text-xs font-medium ${isAfter ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
        {isAfter
          ? '✅ Settings accessible from header gear icon AND sidebar — 1 click from anywhere'
          : '❌ Settings hidden inside profile dropdown menu — requires 3+ clicks to discover'
        }
      </div>
    </div>
  );
}

export default function WireframeView() {
  const { id } = useParams();
  const wireframe = wireframes[id];
  const [view, setView] = useState('comparison'); // 'comparison', 'before', 'after'
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPNG = () => {
    // In production this would use html2canvas or similar
    alert('Exporting wireframe as PNG... (In production, this would download the wireframe image)');
  };

  const handleShareTeams = () => {
    // In production this would use MS Teams deep link
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this wireframe: ${wireframe.title}`);
    window.open(`https://teams.microsoft.com/share?href=${url}&preview=true&msgText=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Wireframe: ${wireframe.title}`);
    const body = encodeURIComponent(`Hi team,\n\nCheck out this proposed design solution:\n\n${wireframe.title}\n${wireframe.description}\n\nView it here: ${window.location.href}\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!wireframe) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl text-white">Wireframe not found</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{wireframe.title}</h1>
          <p className="text-sm text-gray-400">{wireframe.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
            {[
              { id: 'comparison', label: 'Compare' },
              { id: 'before', label: 'Before' },
              { id: 'after', label: 'After' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${view === id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
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

      {/* Wireframe display */}
      {view === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Current (Problem)</span>
            </div>
            <WireframePanel type="before" data={wireframe.before} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Proposed (Solution)</span>
            </div>
            <WireframePanel type="after" data={wireframe.after} />
          </div>
        </div>
      )}

      {view === 'before' && (
        <div className="max-w-3xl mx-auto mb-8">
          <WireframePanel type="before" data={wireframe.before} />
        </div>
      )}

      {view === 'after' && (
        <div className="max-w-3xl mx-auto mb-8">
          <WireframePanel type="after" data={wireframe.after} />
        </div>
      )}

      {/* Design annotations */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-indigo-400" />
          Design Changes Applied
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wireframe.annotations.map((note, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
