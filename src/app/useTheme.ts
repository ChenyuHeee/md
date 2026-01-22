import { useEffect, useMemo, useState } from 'react';
import type { ThemeMode } from '../types/models';

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'light') {
    root.dataset.theme = 'light';
    return;
  }
  if (mode === 'dark') {
    root.dataset.theme = 'dark';
    return;
  }

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  root.dataset.theme = mql.matches ? 'dark' : 'light';
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
