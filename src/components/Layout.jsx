import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, BarChart3, Sparkles, Globe } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/submit', label: 'Submit Feedback', icon: MessageSquarePlus },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/add-website', label: 'Add Website', icon: Globe },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            FeedbackFlow
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === path
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-700 mx-2" />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
