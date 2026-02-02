export function stripFileExtensionForDisplay(name: string) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '';

  // Keep simple dotfiles like ".env" as-is.
  if (/^\.[^./\\]+$/.test(trimmed)) return trimmed;

  if (/\.markdown$/i.test(trimmed)) return trimmed.replace(/\.markdown$/i, '');

  // Strip common extension-like suffix (letters only) for display.
  return trimmed.replace(/\.[a-z]{1,5}$/i, '');
}
