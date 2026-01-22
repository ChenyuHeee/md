import React, { useMemo, useState } from 'react';
import { Modal } from './Modal';
import type { TreeState } from '../storage/tree';
import { listChildren } from '../storage/tree';

export function MoveDialog(props: {
  tree: TreeState;
  currentId: string;
  onMoveTo: (folderId: string) => void;
  onClose: () => void;
}) {
  const folders = useMemo(() => {
    const out: Array<{ id: string; path: string }> = [];

    const root = props.tree.nodes[props.tree.rootId];
    if (!root) return out;

    function walk(folderId: string, prefix: string) {
      const folder = props.tree.nodes[folderId];
      if (!folder || folder.type !== 'folder') return;

      const label = prefix ? `${prefix}/${folder.name}` : folder.name;
      out.push({ id: folderId, path: label });

      for (const child of listChildren(props.tree, folderId)) {
        if (child.type === 'folder') walk(child.id, label);
      }
    }

    walk(props.tree.rootId, '');

    return out;
  }, [props.tree]);

  const [dest, setDest] = useState(props.tree.rootId);

  return (
    <Modal
      title="移动到…"
      onClose={props.onClose}
      footer={
        <>
          <button className="modang-btn" onClick={props.onClose}>
            取消
          </button>
          <button
            className="modang-btn"
            onClick={() => {
              props.onMoveTo(dest);
              props.onClose();
            }}
          >
            移动
          </button>
        </>
      }
    >
      <div className="row">
        <div className="modang-muted">目标文件夹</div>
        <select className="modang-input" value={dest} onChange={(e) => setDest(e.target.value)}>
          {folders.map((f) => (
            <option key={f.id} value={f.id} disabled={f.id === props.currentId}>
              {f.path}
            </option>
          ))}
        </select>
      </div>

      <div className="modang-muted">TODO：未来可支持拖拽移动。</div>
    </Modal>
  );
}
