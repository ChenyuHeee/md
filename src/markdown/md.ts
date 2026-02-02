import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import taskLists from 'markdown-it-task-lists';

function addSourceLineAttr(token: any) {
  const map = token?.map;
  if (!Array.isArray(map) || typeof map[0] !== 'number') return;
  // markdown-it line numbers are 0-based.
  token.attrSet('data-source-line', String(map[0] + 1));
}

function wrapOpenRuleWithSourceLine(md: any, ruleName: string) {
  const original = md.renderer.rules[ruleName];
  md.renderer.rules[ruleName] = (tokens: any, idx: number, options: any, env: any, self: any) => {
    const token = tokens[idx];
    addSourceLineAttr(token);
    return original ? original(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  };
}

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

  // Add source line markers for preview sync.
  // We annotate common block-level open tokens.
  const sourceOpenRules = [
    'paragraph_open',
    'heading_open',
    'blockquote_open',
    'bullet_list_open',
    'ordered_list_open',
    'list_item_open',
    'table_open',
    'thead_open',
    'tbody_open',
    'tr_open',
    'th_open',
    'td_open',
  ];
  for (const r of sourceOpenRules) wrapOpenRuleWithSourceLine(md, r);
  wrapOpenRuleWithSourceLine(md, 'hr');

  // Make sure highlight.js CSS applies (expects .hljs on <code>).
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, self: any) => {
    const token = tokens[idx];
    addSourceLineAttr(token);
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
