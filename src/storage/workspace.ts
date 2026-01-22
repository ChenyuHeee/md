import type { Settings } from '../types/models';
import { getFileContent, putFileContent } from './db';
import { createDefaultTree, loadTree, saveTree, type TreeState } from './tree';
import { loadSettings, saveSettings } from './settings';

export type WorkspaceBootstrap = {
  settings: Settings;
  tree: TreeState;
  currentFileId: string;
};

const DEFAULT_README = `# 墨档\n\n这是一个纯前端静态 Markdown 编辑器：\n\n- 数据只保存在你的浏览器本地（localStorage + IndexedDB）\n- 不做任何外部上传\n\n## 快捷操作\n\n- 左侧文件树：新建/重命名/删除/移动\n- 中间编辑，右侧预览\n\n> TODO: 导出 HTML/PDF、拖拽移动等\n`;

export async function bootstrapWorkspace(): Promise<WorkspaceBootstrap> {
  const settings = loadSettings();

  const existingTree = loadTree();
  if (existingTree) {
    const currentFileId =
      settings.lastOpenFileId && existingTree.nodes[settings.lastOpenFileId]?.type === 'file'
        ? settings.lastOpenFileId
        : pickFirstFileId(existingTree);

    return { settings, tree: existingTree, currentFileId };
  }

  const { tree, readmeId } = createDefaultTree();
  saveTree(tree);

  const now = Date.now();
  await putFileContent({ fileId: readmeId, content: DEFAULT_README, updatedAt: now });

  const nextSettings: Settings = { ...settings, lastOpenFileId: readmeId };
  saveSettings(nextSettings);

  return { settings: nextSettings, tree, currentFileId: readmeId };
}

export function persistTree(tree: TreeState) {
  saveTree(tree);
}

export async function loadFileText(fileId: string): Promise<string> {
  const rec = await getFileContent(fileId);
  return rec?.content ?? '';
}

export async function saveFileText(fileId: string, content: string): Promise<void> {
  await putFileContent({ fileId, content, updatedAt: Date.now() });
}

export function updateLastOpenFileId(fileId: string) {
  const settings = loadSettings();
  const next = { ...settings, lastOpenFileId: fileId };
  saveSettings(next);
}

function pickFirstFileId(tree: TreeState): string {
  const root = tree.nodes[tree.rootId];
  const stack = root?.childrenIds ? [...root.childrenIds] : [];
  while (stack.length > 0) {
    const id = stack.shift()!;
    const node = tree.nodes[id];
    if (!node) continue;
    if (node.type === 'file') return id;
    stack.unshift(...node.childrenIds);
  }
  // fallback: create a fake file id if tree is broken
  return tree.rootId;
}
