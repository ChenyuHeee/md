export type Shortcut = {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
};

const isMacLike = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform);

function normalizeKey(raw: string): string {
  const k = raw.trim();
  if (!k) return '';

  const lower = k.toLowerCase();
  if (lower === 'esc') return 'Escape';
  if (lower === 'space') return 'Space';
  if (lower === 'return') return 'Enter';

  // Single character keys.
  if (k.length === 1) return k.toUpperCase();

  // Keep known key names as-is.
  const known = new Set([
    'Enter',
    'Escape',
    'Tab',
    'Backspace',
    'Delete',
    'Space',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
    'PageUp',
    'PageDown',
  ]);
  if (known.has(k)) return k;

  // Capitalize first letter fallback.
  const first = k[0];
  if (!first) return '';
  return first.toUpperCase() + k.slice(1);
}

export function parseShortcut(input: string): Shortcut | null {
  const raw = (input || '').trim();
  if (!raw) return null;

  const parts = raw
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);

  let ctrl = false;
  let meta = false;
  let alt = false;
  let shift = false;
  let key = '';

  for (const p of parts) {
    const lower = p.toLowerCase();
    if (lower === 'mod') {
      if (isMacLike) meta = true;
      else ctrl = true;
      continue;
    }
    if (lower === 'ctrl' || lower === 'control') {
      ctrl = true;
      continue;
    }
    if (lower === 'cmd' || lower === 'command' || lower === 'meta') {
      meta = true;
      continue;
    }
    if (lower === 'alt' || lower === 'option') {
      alt = true;
      continue;
    }
    if (lower === 'shift') {
      shift = true;
      continue;
    }

    // treat as key
    key = normalizeKey(p);
  }

  if (!key) return null;
  return { key, ctrl, meta, alt, shift };
}

export function shortcutToString(s: Shortcut): string {
  const parts: string[] = [];
  if (s.ctrl) parts.push('Ctrl');
  if (s.meta) parts.push('Meta');
  if (s.alt) parts.push('Alt');
  if (s.shift) parts.push('Shift');
  parts.push(s.key);
  return parts.join('+');
}

export function eventToShortcutString(e: KeyboardEvent): string | null {
  // Ignore pure modifier presses.
  const key = normalizeKey(e.key);
  if (!key || ['Shift', 'Alt', 'Meta', 'Control'].includes(key)) return null;

  // Normalize Space.
  const finalKey = key === ' ' ? 'Space' : key;

  const s: Shortcut = {
    key: finalKey,
    ctrl: e.ctrlKey,
    meta: e.metaKey,
    alt: e.altKey,
    shift: e.shiftKey,
  };

  return shortcutToString(s);
}

export function matchShortcut(binding: string | undefined | null, e: KeyboardEvent): boolean {
  const parsed = binding ? parseShortcut(binding) : null;
  if (!parsed) return false;

  const key = normalizeKey(e.key);
  const finalKey = key === ' ' ? 'Space' : key;

  return (
    finalKey === parsed.key &&
    e.ctrlKey === parsed.ctrl &&
    e.metaKey === parsed.meta &&
    e.altKey === parsed.alt &&
    e.shiftKey === parsed.shift
  );
}

export function formatShortcutForDisplay(binding: string | undefined | null): string {
  const parsed = binding ? parseShortcut(binding) : null;
  if (!parsed) return '';

  // Prefer a friendly Mod display.
  const parts: string[] = [];
  const modLabel = isMacLike ? '⌘' : 'Ctrl';
  if ((isMacLike && parsed.meta && !parsed.ctrl) || (!isMacLike && parsed.ctrl && !parsed.meta)) {
    // show Mod as single symbol/label if it matches platform
    parts.push(modLabel);
  } else {
    if (parsed.ctrl) parts.push('Ctrl');
    if (parsed.meta) parts.push(isMacLike ? '⌘' : 'Meta');
  }

  if (parsed.alt) parts.push(isMacLike ? '⌥' : 'Alt');
  if (parsed.shift) parts.push(isMacLike ? '⇧' : 'Shift');

  const key = parsed.key;
  const keyPretty: Record<string, string> = {
    Enter: 'Enter',
    Escape: 'Esc',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Space: 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Tab: 'Tab',
  };

  parts.push(keyPretty[key] ?? key);
  return parts.join('+');
}
