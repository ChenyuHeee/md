import hljsLight from 'highlight.js/styles/github.css?raw';
import hljsDark from 'highlight.js/styles/github-dark.css?raw';

const STYLE_ID = 'modang-hljs-theme';

function ensureStyleEl(): HTMLStyleElement {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  return el;
}

export function applyHighlightJsTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const el = ensureStyleEl();
  el.textContent = theme === 'dark' ? hljsDark : hljsLight;
}
