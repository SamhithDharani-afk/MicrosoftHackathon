import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { websites as seedWebsites } from '../data/mockData';

const WebsitesContext = createContext(null);

const STORAGE_KEY = 'feedbackflow_websites';
const ACTIVE_KEY = 'feedbackflow_active_website';
const HIDDEN_SEED_KEY = 'feedbackflow_hidden_seed_websites';

function loadUserWebsites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadHiddenSeedIds() {
  try {
    const raw = localStorage.getItem(HIDDEN_SEED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WebsitesProvider({ children }) {
  // User-added websites are persisted; seed websites always come from mockData.
  const [userWebsites, setUserWebsites] = useState(loadUserWebsites);
  // Seed websites the user has chosen to hide/delete (we can't mutate mockData,
  // so we remember which seeds to filter out).
  const [hiddenSeedIds, setHiddenSeedIds] = useState(loadHiddenSeedIds);
  const [activeWebsiteId, setActiveWebsiteId] = useState(() => {
    return localStorage.getItem(ACTIVE_KEY) || seedWebsites[0]?.id || null;
  });

  const websites = useMemo(
    () => [...seedWebsites.filter((w) => !hiddenSeedIds.includes(w.id)), ...userWebsites],
    [userWebsites, hiddenSeedIds]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWebsites));
  }, [userWebsites]);

  useEffect(() => {
    localStorage.setItem(HIDDEN_SEED_KEY, JSON.stringify(hiddenSeedIds));
  }, [hiddenSeedIds]);

  useEffect(() => {
    if (activeWebsiteId) localStorage.setItem(ACTIVE_KEY, activeWebsiteId);
  }, [activeWebsiteId]);

  const setActiveWebsite = useCallback((id) => setActiveWebsiteId(id), []);

  const addWebsite = useCallback((site) => {
    const id =
      site.id ||
      (site.name || 'site')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6);
    const newSite = {
      id,
      name: site.name || 'Untitled Site',
      shortName: site.shortName || site.name || 'Site',
      url: site.url || '',
      emoji: site.emoji || '🌐',
      accent: site.accent || 'indigo',
      repoConnected: !!site.repoUrl,
      repoUrl: site.repoUrl || '',
      seed: false,
      addedAt: new Date().toISOString(),
    };
    setUserWebsites((prev) => [...prev, newSite]);
    setActiveWebsiteId(id);
    return newSite;
  }, []);

  // Remove a website. User-added sites are dropped from storage; seed sites are
  // remembered as "hidden" so they stay gone across reloads. If the active site
  // is removed, fall back to the first one still available.
  const removeWebsite = useCallback((id) => {
    const isSeed = seedWebsites.some((w) => w.id === id);
    if (isSeed) {
      setHiddenSeedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setUserWebsites((prev) => prev.filter((w) => w.id !== id));
    }
    setActiveWebsiteId((current) => {
      if (current !== id) return current;
      const remaining = [
        ...seedWebsites.filter((w) => w.id !== id && !hiddenSeedIds.includes(w.id)),
        ...userWebsites.filter((w) => w.id !== id),
      ];
      return remaining[0]?.id || null;
    });
  }, [userWebsites, hiddenSeedIds]);

  const activeWebsite = useMemo(
    () => websites.find((w) => w.id === activeWebsiteId) || websites[0] || null,
    [websites, activeWebsiteId]
  );

  const value = useMemo(
    () => ({ websites, activeWebsite, activeWebsiteId, setActiveWebsite, addWebsite, removeWebsite }),
    [websites, activeWebsite, activeWebsiteId, setActiveWebsite, addWebsite, removeWebsite]
  );

  return <WebsitesContext.Provider value={value}>{children}</WebsitesContext.Provider>;
}

export function useWebsites() {
  const ctx = useContext(WebsitesContext);
  if (!ctx) throw new Error('useWebsites must be used within a WebsitesProvider');
  return ctx;
}
