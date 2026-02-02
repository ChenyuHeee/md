import React, { useMemo, useRef } from 'react';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';
import type { FileNode } from '../types/models';
import type { TreeState } from '../storage/tree';
import { listChildren } from '../storage/tree';
import { stripFileExtensionForDisplay } from '../utils/filename';

export function FileTree(props: {
  tree: TreeState;
  selectedId: string | null;
  expanded: Set<string>;
  language: Language;
  onToggleFolder: (id: string) => void;
  onSelect: (id: string) => void;
  onContextMenu?: (id: string, clientX: number, clientY: number) => void;
  onRequestRename?: (id: string) => void;
  onRequestDelete?: (id: string) => void;
}) {
  const { t } = useI18n(props.language);
  const root = props.tree.nodes[props.tree.rootId];
  const wrapRef = useRef<HTMLDivElement | null>(null);

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

  if (!root) return <div className="fileTree" style={{ color: 'var(--text-2)' }}>{t('fileTree.error')}</div>;

  return (
    <div
      className="fileTree"
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={(e) => {
        const id = props.selectedId;
        if (!id) return;

        if (e.key === 'Enter') {
          e.preventDefault();
          props.onRequestRename?.(id);
          return;
        }

        const isDeleteKey = e.key === 'Backspace' || e.key === 'Delete';
        if (isDeleteKey && e.metaKey) {
          e.preventDefault();
          props.onRequestDelete?.(id);
        }
      }}
    >

      {rows.map((row) => {
        const { node, depth } = row;
        const selected = props.selectedId === node.id;
        const isFolder = node.type === 'folder';
        const expanded = isFolder && props.expanded.has(node.id);
        const displayName = node.type === 'file' ? stripFileExtensionForDisplay(node.name) : node.name;
        return (
          <div
            key={node.id}
            className={`treeRow ${selected ? 'isSelected' : ''}`}
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => {
              wrapRef.current?.focus();
              props.onSelect(node.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              wrapRef.current?.focus();
              props.onContextMenu?.(node.id, e.clientX, e.clientY);
            }}
            onDoubleClick={() => {
              if (isFolder) props.onToggleFolder(node.id);
            }}
            title={displayName}
          >
            <span className="treeIcon">
              {isFolder ? (
                expanded ? (
                  <FolderOpen size={16} />
                ) : (
                  <Folder size={16} />
                )
              ) : (
                <FileText size={16} />
              )}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
