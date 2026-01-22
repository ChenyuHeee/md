import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createMarkdownIt } from '../markdown/md';
import {
  makeMissingAssetDataUrl,
  parseAssetId,
  resolveAssetToObjectUrl,
  MODANG_ASSET_PREFIX,
} from '../markdown/assets';

export function PreviewPane(props: { markdown: string }) {
  const md = useMemo(() => createMarkdownIt(), []);
  const [html, setHtml] = useState('');
  const urlsToRevokeRef = useRef<string[]>([]);

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

  return <div className="modang-preview" dangerouslySetInnerHTML={{ __html: html }} />;
}
