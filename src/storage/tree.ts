import { nanoid } from 'nanoid';
import { LS_KEYS } from './keys';
import type { FileNode } from '../types/models';

export type TreeState = {
  rootId: string;
  nodes: Record<string, FileNode>;
};

const ROOT_ID = 'root';

export function loadTree(): TreeState | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.tree);
    if (!raw) return null;
    return JSON.parse(raw) as TreeState;
  } catch {
    return null;
  }
}

export function saveTree(tree: TreeState): void {
  localStorage.setItem(LS_KEYS.tree, JSON.stringify(tree));
}

export function createDefaultTree(now = Date.now()): { tree: TreeState; readmeId: string } {
  const readmeId = nanoid();
  const tree: TreeState = {
    rootId: ROOT_ID,
    nodes: {
      [ROOT_ID]: {
        id: ROOT_ID,
        name: '墨档',
        type: 'folder',
        parentId: null,
        childrenIds: [readmeId],
        createdAt: now,
        updatedAt: now,
      },
      [readmeId]: {
        id: readmeId,
        name: 'README.md',
        type: 'file',
        parentId: ROOT_ID,
        childrenIds: [],
        createdAt: now,
        updatedAt: now,
      },
    },
  };

  return { tree, readmeId };
}

export function getNode(tree: TreeState, id: string): FileNode {
  const node = tree.nodes[id];
  if (!node) throw new Error(`Node not found: ${id}`);
  return node;
}

export function listChildren(tree: TreeState, folderId: string): FileNode[] {
  const folder = getNode(tree, folderId);
  return folder.childrenIds
    .map((id) => tree.nodes[id])
    .filter((n): n is FileNode => Boolean(n))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function createFolder(
  tree: TreeState,
  parentFolderId: string,
  name: string,
  now = Date.now(),
): { tree: TreeState; id: string } {
  const id = nanoid();
  const parent = getNode(tree, parentFolderId);
  if (parent.type !== 'folder') throw new Error('Parent must be folder');

  const next: TreeState = {
    ...tree,
    nodes: {
      ...tree.nodes,
      [id]: {
        id,
        name,
        type: 'folder',
        parentId: parentFolderId,
        childrenIds: [],
        createdAt: now,
        updatedAt: now,
      },
      [parentFolderId]: {
        ...parent,
        childrenIds: [...parent.childrenIds, id],
        updatedAt: now,
      },
    },
  };

  return { tree: next, id };
}

export function createFile(
  tree: TreeState,
  parentFolderId: string,
  name: string,
  now = Date.now(),
): { tree: TreeState; id: string } {
  const id = nanoid();
  const parent = getNode(tree, parentFolderId);
  if (parent.type !== 'folder') throw new Error('Parent must be folder');

  const next: TreeState = {
    ...tree,
    nodes: {
      ...tree.nodes,
      [id]: {
        id,
        name,
        type: 'file',
        parentId: parentFolderId,
        childrenIds: [],
        createdAt: now,
        updatedAt: now,
      },
      [parentFolderId]: {
        ...parent,
        childrenIds: [...parent.childrenIds, id],
        updatedAt: now,
      },
    },
  };

  return { tree: next, id };
}

export function renameNode(tree: TreeState, id: string, name: string, now = Date.now()): TreeState {
  const node = getNode(tree, id);
  return {
    ...tree,
    nodes: {
      ...tree.nodes,
      [id]: {
        ...node,
        name,
        updatedAt: now,
      },
    },
  };
}

function collectSubtreeIds(tree: TreeState, id: string, acc: Set<string>) {
  acc.add(id);
  const node = getNode(tree, id);
  if (node.type === 'folder') {
    for (const childId of node.childrenIds) collectSubtreeIds(tree, childId, acc);
  }
}

export function collectSubtreeFileIds(tree: TreeState, id: string): string[] {
  const ids = new Set<string>();
  collectSubtreeIds(tree, id, ids);
  return [...ids].filter((nid) => tree.nodes[nid]?.type === 'file');
}

export function deleteNode(tree: TreeState, id: string, now = Date.now()): { tree: TreeState; deletedIds: string[] } {
  const node = getNode(tree, id);
  if (!node.parentId) throw new Error('Cannot delete root');

  const toDelete = new Set<string>();
  collectSubtreeIds(tree, id, toDelete);

  const parent = getNode(tree, node.parentId);
  const nextNodes: Record<string, FileNode> = { ...tree.nodes };
  for (const delId of toDelete) delete nextNodes[delId];

  nextNodes[parent.id] = {
    ...parent,
    childrenIds: parent.childrenIds.filter((cid) => cid !== id),
    updatedAt: now,
  };

  return {
    tree: { ...tree, nodes: nextNodes },
    deletedIds: [...toDelete],
  };
}

export function moveNode(
  tree: TreeState,
  id: string,
  toFolderId: string,
  now = Date.now(),
): TreeState {
  const node = getNode(tree, id);
  if (!node.parentId) throw new Error('Cannot move root');

  const toFolder = getNode(tree, toFolderId);
  if (toFolder.type !== 'folder') throw new Error('Destination must be folder');

  // Prevent moving folder into its own subtree
  if (node.type === 'folder') {
    const subtree = new Set<string>();
    collectSubtreeIds(tree, id, subtree);
    if (subtree.has(toFolderId)) throw new Error('Cannot move into its own subtree');
  }

  const fromParent = getNode(tree, node.parentId);

  return {
    ...tree,
    nodes: {
      ...tree.nodes,
      [fromParent.id]: {
        ...fromParent,
        childrenIds: fromParent.childrenIds.filter((cid) => cid !== id),
        updatedAt: now,
      },
      [toFolder.id]: {
        ...toFolder,
        childrenIds: [...toFolder.childrenIds, id],
        updatedAt: now,
      },
      [id]: {
        ...node,
        parentId: toFolder.id,
        updatedAt: now,
      },
    },
  };
}

export function resolveParentFolderId(tree: TreeState, selectedId: string | null): string {
  if (!selectedId) return tree.rootId;
  const selected = tree.nodes[selectedId];
  if (!selected) return tree.rootId;
  if (selected.type === 'folder') return selected.id;
  return selected.parentId ?? tree.rootId;
}

export function getAncestorFolderIds(tree: TreeState, nodeId: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  let cur: FileNode | null = tree.nodes[nodeId] ?? null;
  if (!cur) return result;

  // For files, start from its parent folder. For folders, include itself.
  if (cur.type === 'file') {
    cur = cur.parentId ? tree.nodes[cur.parentId] ?? null : null;
  }

  while (cur && cur.type === 'folder') {
    if (seen.has(cur.id)) break;
    seen.add(cur.id);
    result.push(cur.id);
    if (!cur.parentId) break;
    cur = tree.nodes[cur.parentId] ?? null;
  }

  // root -> leaf order
  return result.reverse();
}
