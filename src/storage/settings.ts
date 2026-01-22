import { LS_KEYS } from './keys';
import type { Settings, ThemeMode } from '../types/models';

const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  language: 'zh-CN',
  ui: {
    leftWidth: 260,
    centerWidth: 520,
    rightWidth: 420,
  },
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(LS_KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Settings;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      ui: { ...DEFAULT_SETTINGS.ui, ...(parsed.ui ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(LS_KEYS.settings, JSON.stringify(settings));
}

export function setThemeMode(mode: ThemeMode): void {
  const next = { ...loadSettings(), themeMode: mode };
  saveSettings(next);
}
