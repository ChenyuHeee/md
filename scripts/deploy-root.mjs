import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, 'dist');

const COPY_ITEMS = [
  'index.html',
  '404.html',
  '.nojekyll',
  'assets',
];

const PRESERVE_ASSETS_SUBDIRS = [
  // Keep README screenshots and other hand-managed files.
  path.join('assets', 'img'),
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function rimraf(target) {
  if (!(await exists(target))) return;
  await fs.rm(target, { recursive: true, force: true });
}

async function removeDeployedAssetsPreserving(assetsDir, preserveSubdirs) {
  if (!(await exists(assetsDir))) return;

  const preserveAbs = new Set(preserveSubdirs.map((p) => path.join(repoRoot, p)));
  const entries = await fs.readdir(assetsDir);
  for (const name of entries) {
    const abs = path.join(assetsDir, name);
    // Preserve any explicitly pinned subdirectory.
    if (preserveAbs.has(abs)) continue;
    await fs.rm(abs, { recursive: true, force: true });
  }
}

async function copyRecursive(src, dst) {
  const st = await fs.stat(src);
  if (st.isDirectory()) {
    await fs.mkdir(dst, { recursive: true });
    const entries = await fs.readdir(src);
    for (const name of entries) {
      await copyRecursive(path.join(src, name), path.join(dst, name));
    }
    return;
  }
  await fs.mkdir(path.dirname(dst), { recursive: true });
  await fs.copyFile(src, dst);
}

async function main() {
  if (!(await exists(distDir))) {
    throw new Error('dist/ not found. Run `npm run build` first.');
  }

  // Remove previous deployed artifacts in repo root (safe allowlist).
  // NOTE: Do NOT delete repoRoot/assets entirely, as it may contain hand-managed
  // files (e.g. README screenshots in assets/img). Only remove generated assets.
  for (const item of COPY_ITEMS) {
    const target = path.join(repoRoot, item);
    if (item === 'assets') {
      await fs.mkdir(target, { recursive: true });
      await removeDeployedAssetsPreserving(target, PRESERVE_ASSETS_SUBDIRS);
    } else {
      await rimraf(target);
    }
  }

  // Copy fresh artifacts.
  for (const item of COPY_ITEMS) {
    const src = path.join(distDir, item);
    if (!(await exists(src))) {
      console.warn(`[deploy-root] skip missing: ${item}`);
      continue;
    }
    await copyRecursive(src, path.join(repoRoot, item));
    console.log(`[deploy-root] synced: ${item}`);
  }

  console.log('[deploy-root] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
