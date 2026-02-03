import { useEffect, useMemo, useState } from 'react';
import type { ThemeMode } from '../types/models';
import { applyHighlightJsTheme } from '../styles/hljsTheme';

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  let theme: 'light' | 'dark';
  if (mode === 'light' || mode === 'dark') {
    theme = mode;
  } else {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    theme = mql.matches ? 'dark' : 'light';
  }

  root.dataset.theme = theme;
  applyHighlightJsTheme(theme);
}

export function useTheme(themeMode: ThemeMode) {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    applyTheme(themeMode);

    if (themeMode !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (ev: MediaQueryListEvent) => {
      setSystemDark(ev.matches);
      applyTheme('system');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [themeMode]);

  const resolvedTheme = themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode;
  return useMemo(() => ({ systemDark, resolvedTheme }), [resolvedTheme, systemDark]);
}
