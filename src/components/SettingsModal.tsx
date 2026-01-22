import React, { useState } from 'react';
import type { ThemeMode } from '../types/models';
import { Modal } from './Modal';

export function SettingsModal(props: {
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<ThemeMode>(props.themeMode);

  return (
    <Modal
      title="设置"
      onClose={props.onClose}
      footer={
        <>
          <button className="modang-btn" onClick={props.onClose}>
            取消
          </button>
          <button
            className="modang-btn"
            onClick={() => {
              props.onChangeTheme(mode);
              props.onClose();
            }}
          >
            保存
          </button>
        </>
      }
    >
      <div className="row">
        <div className="modang-muted">主题</div>
        <select className="modang-input" value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}>
          <option value="system">跟随系统</option>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>

      <div className="modang-muted">
        隐私说明：墨档不包含任何自建后端，所有数据仅保存在你的浏览器本地（localStorage + IndexedDB）。
      </div>
    </Modal>
  );
}
