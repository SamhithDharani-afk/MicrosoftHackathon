import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, ChevronRight } from 'lucide-react';
import { painPoints, walkthroughs } from '../data/mockData';

export default function PainPointDetail() {
  const { id } = useParams();
  const painPoint = painPoints.find(p => p.id === id);
  const walkthrough = walkthroughs['sol-003'];

  if (!painPoint) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl text-white">Pain point not found</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:underline mt-4 inline-block">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-white mb-4">{painPoint.title}</h1>
      <p className="text-gray-400 mb-8">{painPoint.summary}</p>

      {/* Video Walkthrough Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-green-400" />
          Visual Walkthrough: How to Make Settings Accessible
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
    </div>
  );
}
