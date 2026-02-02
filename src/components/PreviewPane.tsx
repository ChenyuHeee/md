import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createMarkdownIt } from '../markdown/md';
import {
  makeMissingAssetDataUrl,
  parseAssetId,
  resolveAssetToObjectUrl,
  MODANG_ASSET_PREFIX,
} from '../markdown/assets';

export function PreviewPane(props: {
  markdown: string;
  activeLine?: number;
  onRequestFocusLine?: (line: number) => void;
}) {
  const md = useMemo(() => createMarkdownIt(), []);
  const [html, setHtml] = useState('');
  const urlsToRevokeRef = useRef<string[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const rawHtml = md.render(props.markdown || '');

    let cancelled = false;

    const run = async () => {
      // Revoke last round
      for (const u of urlsToRevokeRef.current) URL.revokeObjectURL(u);
      urlsToRevokeRef.current = [];

      const wrapper = document.createElement('div');
      wrapper.innerHTML = rawHtml;

      const imgs = Array.from(wrapper.querySelectorAll('img'));
      for (const img of imgs) {
        const src = img.getAttribute('src') ?? '';
        if (!src.startsWith(MODANG_ASSET_PREFIX)) continue;
        const assetId = parseAssetId(src);
        if (!assetId) continue;

        const url = await resolveAssetToObjectUrl(assetId);
        if (!url) {
          img.setAttribute('src', makeMissingAssetDataUrl(assetId));
          img.setAttribute('data-asset-missing', 'true');
          continue;
        }

        urlsToRevokeRef.current.push(url);
        img.setAttribute('src', url);
      }

      if (cancelled) return;
      setHtml(wrapper.innerHTML);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [md, props.markdown]);

  useEffect(() => {
    return () => {
      for (const u of urlsToRevokeRef.current) URL.revokeObjectURL(u);
      urlsToRevokeRef.current = [];
    };
  }, []);

  useEffect(() => {
    const line = props.activeLine;
    if (!line) return;
    const root = rootRef.current;
    if (!root) return;

    // Find the closest element whose source line <= cursor line.
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-source-line]'));
    if (items.length === 0) return;

    let best: HTMLElement | null = null;
    let bestLine = -1;
    for (const el of items) {
      const raw = el.getAttribute('data-source-line');
      const n = raw ? Number.parseInt(raw, 10) : NaN;
      if (!Number.isFinite(n)) continue;
      if (n <= line && n > bestLine) {
        best = el;
        bestLine = n;
      }
    }
    if (!best) best = items[0] ?? null;
    if (!best) return;

    // Update highlight.
    if (activeElRef.current && activeElRef.current !== best) {
      activeElRef.current.classList.remove('previewActiveLine');
    }
    activeElRef.current = best;
    best.classList.add('previewActiveLine');

    // Scroll minimally to keep it visible.
    best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [props.activeLine, html]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!props.onRequestFocusLine) return;
    const root = rootRef.current;
    if (!root) return;

    // Don't steal clicks from links (including Cmd/Ctrl click).
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('a')) return;

    // If user is selecting text in preview, do nothing.
    try {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
    } catch {
      // ignore
    }

    const el = target.closest<HTMLElement>('[data-source-line]');
    if (!el || !root.contains(el)) return;

    const raw = el.getAttribute('data-source-line');
    const line = raw ? Number.parseInt(raw, 10) : NaN;
    if (!Number.isFinite(line) || line <= 0) return;

    props.onRequestFocusLine(line);
  };

  return <div ref={rootRef} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
