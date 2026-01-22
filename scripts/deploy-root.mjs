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
  for (const item of COPY_ITEMS) {
    await rimraf(path.join(repoRoot, item));
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
