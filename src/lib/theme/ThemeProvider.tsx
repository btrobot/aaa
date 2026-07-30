'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { getThemeById, type ThemePreset } from './presets';

interface ThemeContextType {
  theme: ThemePreset;
  loading: boolean;
  setTheme: (themeId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null as unknown as ThemePreset,
  loading: true,
  setTheme: async () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreset | null>(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = useCallback((preset: ThemePreset) => {
    const root = document.documentElement;
    // Apply all CSS variable overrides
    for (const [key, value] of Object.entries(preset.colors)) {
      root.style.setProperty(key, value);
    }
    // Set data attribute for dark mode
    root.setAttribute('data-theme', preset.id);
    if (preset.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const loadTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const themeId = data.active_theme || 'default';
      const preset = getThemeById(themeId) || getThemeById('default')!;
      setThemeState(preset);
      applyTheme(preset);
    } catch {
      const preset = getThemeById('default')!;
      setThemeState(preset);
      applyTheme(preset);
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  const setTheme = useCallback(async (themeId: string) => {
    const preset = getThemeById(themeId);
    if (!preset) return;
    setThemeState(preset);
    applyTheme(preset);
    // Save to settings
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_theme: themeId }),
      });
    } catch {
      // ignore
    }
  }, [applyTheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Listen for theme changes from admin
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const preset = getThemeById(e.detail);
      if (preset) {
        setThemeState(preset);
        applyTheme(preset);
      }
    };
    window.addEventListener('theme-change' as any, handler as any);
    return () => window.removeEventListener('theme-change' as any, handler as any);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme: theme || getThemeById('default')!, loading, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}