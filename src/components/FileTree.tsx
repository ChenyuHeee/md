import React, { useMemo } from 'react';
import type { FileNode } from '../types/models';
import type { TreeState } from '../storage/tree';
import { listChildren } from '../storage/tree';

export function FileTree(props: {
  tree: TreeState;
  selectedId: string | null;
  expanded: Set<string>;
  onToggleFolder: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const root = props.tree.nodes[props.tree.rootId];

  const rows = useMemo<Array<{ node: FileNode; depth: number }>>(() => {
    if (!root) return [] as Array<{ node: FileNode; depth: number }>;

    const result: Array<{ node: FileNode; depth: number }> = [];

    function walk(folderId: string, depth: number) {
      const children = listChildren(props.tree, folderId);
      for (const node of children) {
        result.push({ node, depth });
        if (node.type === 'folder' && props.expanded.has(node.id)) {
          walk(node.id, depth + 1);
        }
      }
    }

    walk(props.tree.rootId, 0);
    return result;
  }, [props.expanded, props.tree, root]);

  if (!root) return <div className="modang-filetree modang-muted">工作区损坏</div>;

  return (
    <div className="modang-filetree">
      <div className="modang-node selected" style={{ marginBottom: 6 }}>
        <span className="icon">📁</span>
        <span>{root.name}</span>
      </div>

      {rows.map((row) => {
        const { node, depth } = row;
        const selected = props.selectedId === node.id;
        const isFolder = node.type === 'folder';
        const expanded = isFolder && props.expanded.has(node.id);
        return (
          <div
            key={node.id}
            className={`modang-node ${selected ? 'selected' : ''}`}
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => props.onSelect(node.id)}
            onDoubleClick={() => {
              if (isFolder) props.onToggleFolder(node.id);
            }}
            title={node.name}
          >
            <span className="icon">{isFolder ? (expanded ? '📂' : '📁') : '📄'}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
