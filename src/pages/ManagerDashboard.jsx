import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Users, MessageSquare, Eye, Workflow, Image } from 'lucide-react';
import { painPoints } from '../data/mockData';
import { getFeedback } from '../api';

export default function ManagerDashboard() {
  const [feedbackEntries, setFeedbackEntries] = useState([]);

  useEffect(() => {
    getFeedback().then(setFeedbackEntries).catch(() => setFeedbackEntries([]));
  }, []);

  const totalFeedback = feedbackEntries.length;
  const criticalCount = painPoints.filter(p => p.severity === 'critical').length;
  const avgImpact = Math.round(painPoints.reduce((sum, p) => sum + p.impactScore, 0) / painPoints.length);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manager Dashboard</h1>
        <p className="text-gray-400">AI-analyzed feedback insights with visual solutions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Feedback', value: totalFeedback, icon: MessageSquare, color: 'indigo' },
          { label: 'Pain Points Found', value: painPoints.length, icon: AlertTriangle, color: 'amber' },
          { label: 'Critical Issues', value: criticalCount, icon: TrendingUp, color: 'red' },
          { label: 'Avg Impact Score', value: `${avgImpact}/100`, icon: Users, color: 'green' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 text-${color}-400`} />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${color}-500/10 text-${color}-400`}>
                {color === 'red' ? 'Action Required' : 'Tracked'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Pain Points */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Identified Pain Points
        </h2>
        <div className="space-y-4">
          {painPoints.map((pp) => (
            <div
              key={pp.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
                      ${pp.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {pp.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      Impact Score: <strong className="text-white">{pp.impactScore}/100</strong>
                    </span>
                    <span className="text-xs text-gray-500">
                      Mentions: <strong className="text-white">{pp.mentionCount}</strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{pp.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{pp.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pp.departments.map(dept => (
                      <span key={dept} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Root Cause */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">AI Root Cause Analysis</p>
                <p className="text-sm text-gray-300">{pp.rootCause}</p>
              </div>

              {/* Solutions */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-3">Generated Solutions</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {pp.solutions.map((sol) => {
                    const getIcon = () => {
                      if (sol.type === 'wireframe') return <Image className="w-4 h-4 text-purple-400" />;
                      if (sol.type === 'process-flow') return <Workflow className="w-4 h-4 text-blue-400" />;
                      return <Eye className="w-4 h-4 text-green-400" />;
                    };
                    const getLink = () => {
                      if (sol.type === 'wireframe') return `/wireframe/${sol.id}`;
                      if (sol.type === 'process-flow') return `/process-flow/${sol.id}`;
                      return `/pain-point/${pp.id}`;
                    };
                    const getColor = () => {
                      if (sol.type === 'wireframe') return 'purple';
                      if (sol.type === 'process-flow') return 'blue';
                      return 'green';
                    };

                    return (
                      <Link
                        key={sol.id}
                        to={getLink()}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all hover:scale-[1.02]
                          bg-${getColor()}-500/5 border-${getColor()}-500/20 hover:border-${getColor()}-500/50`}
                      >
                        {getIcon()}
                        <div>
                          <p className="text-sm font-medium text-white mb-1">{sol.title}</p>
                          <p className="text-xs text-gray-400">{sol.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Feedback Table */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Recent Feedback Submissions
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase">Submitter</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase">Department</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase">Severity</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase">Feedback</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbackEntries.map((fb) => (
                <tr key={fb.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-5 py-3 text-white font-medium">{fb.submitter}</td>
                  <td className="px-5 py-3 text-gray-400">{fb.department}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium
                      ${fb.rating <= 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {fb.rating}/5
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-300 max-w-md truncate">{fb.text}</td>
                  <td className="px-5 py-3 text-gray-500">{fb.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
