import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'feedbackflow_theme';
const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // App is dark-first: default to dark for new visitors regardless of OS theme.
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage may be unavailable inside a sandboxed iframe — theme still applies for the session */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
