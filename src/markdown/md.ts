import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import taskLists from 'markdown-it-task-lists';

export function createMarkdownIt() {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    typographer: true,
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch {
          // fallthrough
        }
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch {
        return md.utils.escapeHtml(code);
      }
    },
  });

  // GFM-like features
  md.set({
    // markdown-it already supports tables & strikethrough when enabled
  });

  md.enable(['table', 'strikethrough']);
  md.use(taskLists, { enabled: true, label: true, labelAfter: true });

  // Make sure highlight.js CSS applies (expects .hljs on <code>).
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, self: any) => {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : '';
    const langName = info.split(/\s+/g)[0];
    if (langName) token.attrSet('data-language', langName);

    const existing = token.attrGet('class');
    const next = existing ? `${existing} hljs` : 'hljs';
    token.attrSet('class', next);

    return fence ? fence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  };

  return md;
}
