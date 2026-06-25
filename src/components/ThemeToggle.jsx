import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Light/dark toggle. Used in the app nav and on the standalone (iframe) form.
export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${className}`}
    >
      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
