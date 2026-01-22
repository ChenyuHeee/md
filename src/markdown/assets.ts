import { getAsset } from '../storage/db';

export const MODANG_ASSET_PREFIX = 'modang://asset/';

export function isModangAssetUrl(url: string): boolean {
  return url.startsWith(MODANG_ASSET_PREFIX);
}

export function parseAssetId(url: string): string | null {
  if (!isModangAssetUrl(url)) return null;
  const id = url.slice(MODANG_ASSET_PREFIX.length);
  return id || null;
}

export async function resolveAssetToObjectUrl(assetId: string): Promise<string | null> {
  const asset = await getAsset(assetId);
  if (!asset) return null;
  return URL.createObjectURL(asset.data);
}

export function makeMissingAssetDataUrl(assetId: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80"><rect width="100%" height="100%" fill="#ffefef"/><text x="16" y="44" fill="#b00020" font-family="monospace" font-size="14">Missing asset: ${assetId}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
