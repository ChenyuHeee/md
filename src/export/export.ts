import { createMarkdownIt } from '../markdown/md';
import {
  makeMissingAssetDataUrl,
  parseAssetId,
  MODANG_ASSET_PREFIX,
} from '../markdown/assets';
import { getAsset } from '../storage/db';

// highlight.js themes (bundled as raw text)
import hljsGithubLight from 'highlight.js/styles/github.css?raw';
import hljsGithubDark from 'highlight.js/styles/github-dark.css?raw';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function renderMarkdownHtmlWithInlinedAssets(markdown: string): Promise<string> {
  const md = createMarkdownIt();
  const rawHtml = md.render(markdown || '');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = rawHtml;

  const imgs = Array.from(wrapper.querySelectorAll('img'));
  for (const img of imgs) {
    const src = img.getAttribute('src') ?? '';
    if (!src.startsWith(MODANG_ASSET_PREFIX)) continue;

    const assetId = parseAssetId(src);
    if (!assetId) continue;

    const asset = await getAsset(assetId);
    if (!asset) {
      img.setAttribute('src', makeMissingAssetDataUrl(assetId));
      img.setAttribute('data-asset-missing', 'true');
      continue;
    }

    const dataUrl = await blobToDataUrl(asset.data);
    img.setAttribute('src', dataUrl);
    img.setAttribute('data-asset-inlined', 'true');
  }

  return wrapper.innerHTML;
}

export function buildExportHtmlDocument(params: { title: string; bodyHtml: string }) {
  // Minimal, self-contained Markdown-ish styles.
  const baseCss = `
:root{color-scheme:light dark}
body{margin:0;padding:32px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans";line-height:1.7;background:#ffffff;color:#0f172a}
@media (prefers-color-scheme: dark){body{background:#0b0f14;color:#e5e7eb}}
a{color:#2563eb}
@media (prefers-color-scheme: dark){a{color:#60a5fa}}
img{max-width:100%;height:auto}
h1,h2,h3{line-height:1.25;margin:1.2em 0 .6em}
hr{border:0;border-top:1px solid rgba(148,163,184,.45);margin:1.2em 0}
@media (prefers-color-scheme: dark){hr{border-top-color:rgba(51,65,85,.8)}}
blockquote{margin:1em 0;padding:.2em 1em;border-left:4px solid rgba(148,163,184,.65);color:rgba(51,65,85,.9)}
@media (prefers-color-scheme: dark){blockquote{border-left-color:rgba(71,85,105,.9);color:rgba(226,232,240,.85)}}
pre{padding:12px 14px;overflow:auto;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(248,250,252,.75)}
@media (prefers-color-scheme: dark){pre{border-color:rgba(51,65,85,.8);background:rgba(15,23,42,.6)}}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid rgba(148,163,184,.35);padding:6px 10px;vertical-align:top}
@media (prefers-color-scheme: dark){th,td{border-color:rgba(51,65,85,.8)}}
`;

  const safeTitle = escapeHtml(params.title);

  // Wrap dark theme CSS in media query so a single HTML works for both light & dark.
  const hljsCss = `${hljsGithubLight}\n\n@media (prefers-color-scheme: dark){\n${hljsGithubDark}\n}`;

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>${baseCss}</style>
    <style>${hljsCss}</style>
  </head>
  <body>
    ${params.bodyHtml}
  </body>
</html>`;
}

export function openPrintWindow(htmlDocument: string): boolean {
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return false;

  w.document.open();
  w.document.write(htmlDocument);
  w.document.close();

  // Best-effort: wait for resources then print.
  const doPrint = () => {
    try {
      w.focus();
      w.print();
    } catch {
      // ignore
    }
  };

  // Wait for images to load; fall back after a short delay.
  const wait = async () => {
    try {
      const imgs = Array.from(w.document.images ?? []);
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            }),
        ),
      );
    } catch {
      // ignore
    }

    // Give layout a tick.
    w.setTimeout(doPrint, 50);
  };

  void wait();
  return true;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
