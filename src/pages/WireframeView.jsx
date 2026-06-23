import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { wireframes } from '../data/mockData';

export default function WireframeView() {
  const { id } = useParams();
  const wireframe = wireframes[id];

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

      <h1 className="text-3xl font-bold text-white mb-2">{wireframe.title}</h1>
      <p className="text-gray-400 mb-8">{wireframe.description}</p>

      {/* Before / After comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* BEFORE */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-300">{wireframe.before.label}</h2>
          </div>
          <div className="bg-gray-900 border-2 border-red-500/30 rounded-xl p-6 relative overflow-hidden">
            {/* Mock Viva Engage - Before */}
            <div className="space-y-0">
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-xs text-white font-bold">V</div>
                  <span className="text-sm font-semibold text-white">Viva Engage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔔</span>
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium">JD</div>
                </div>
              </div>

              {/* Body */}
              <div className="flex">
                {/* Sidebar */}
                <div className="w-44 bg-gray-800 p-3 space-y-2 border-r border-gray-700 min-h-[300px]">
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">🏠 Home</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">💬 Communities</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">📢 Announcements</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">👥 People</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">📊 Analytics</div>
                </div>
                {/* Content */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-20 bg-gray-800 rounded border border-gray-700" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                  <div className="h-20 bg-gray-800 rounded border border-gray-700" />
                </div>
              </div>
            </div>

            {/* Arrow showing hidden settings */}
            <div className="absolute top-3 right-3">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-2 py-1 text-xs text-red-300">
                ⚙️ Settings buried here<br/>
                <span className="text-red-400 font-medium">(3+ clicks deep)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AFTER */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-green-300">{wireframe.after.label}</h2>
          </div>
          <div className="bg-gray-900 border-2 border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            {/* Mock Viva Engage - After */}
            <div className="space-y-0">
              {/* Header - WITH GEAR ICON */}
              <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-xs text-white font-bold">V</div>
                  <span className="text-sm font-semibold text-white">Viva Engage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-green-500/30 border-2 border-green-400 flex items-center justify-center text-sm pulse-glow cursor-pointer">⚙️</span>
                  <span className="text-lg">🔔</span>
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium">JD</div>
                </div>
              </div>

              {/* Body */}
              <div className="flex">
                {/* Sidebar - WITH SETTINGS */}
                <div className="w-44 bg-gray-800 p-3 space-y-2 border-r border-gray-700 min-h-[300px] flex flex-col">
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">🏠 Home</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">💬 Communities</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">📢 Announcements</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">👥 People</div>
                  <div className="text-xs text-gray-400 py-1.5 px-2 rounded hover:bg-gray-700">📊 Analytics</div>
                  <div className="flex-1" />
                  <div className="border-t border-gray-700 pt-2">
                    <div className="text-xs text-green-300 py-1.5 px-2 rounded bg-green-500/10 border border-green-500/30 font-medium pulse-glow">
                      ⚙️ Settings
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-20 bg-gray-800 rounded border border-gray-700" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                  <div className="h-20 bg-gray-800 rounded border border-gray-700" />
                </div>
              </div>
            </div>

            {/* Annotations */}
            <div className="absolute top-3 right-3">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-2 py-1 text-xs text-green-300">
                ✅ 1-click access<br/>
                <span className="text-green-400 font-medium">Header + Sidebar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Annotations */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Design Changes</h3>
        <ul className="space-y-3">
          {wireframe.annotations.map((note, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
