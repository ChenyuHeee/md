import React, { useMemo, useState } from 'react';
import { Modal } from './Modal';
import type { TreeState } from '../storage/tree';
import { listChildren } from '../storage/tree';
import type { Language } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

export function MoveDialog(props: {
  tree: TreeState;
  currentId: string;
  language: Language;
  onMoveTo: (folderId: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n(props.language);
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
      title={t('dialog.move.title')}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="secondary" onClick={props.onClose}>
            {t('dialog.move.cancel')}
          </Button>
          <Button
            onClick={() => {
              props.onMoveTo(dest);
              props.onClose();
            }}
          >
            {t('dialog.move.confirm')}
          </Button>
        </>
      }
    >
      <div className="row">
        <div className="subtle">{t('dialog.move.target')}</div>
        <Select value={dest} onChange={(e) => setDest(e.target.value)}>
          {folders.map((f) => (
            <option key={f.id} value={f.id} disabled={f.id === props.currentId}>
              {f.path}
            </option>
          ))}
        </Select>
      </div>

      <div className="subtle">{t('dialog.move.todo')}</div>
    </Modal>
  );
}
