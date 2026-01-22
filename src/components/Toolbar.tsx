import React from 'react';
import type { ThemeMode } from '../types/models';

export function Toolbar(props: {
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onMove: () => void;
  onOpenSettings: () => void;
  onExportMarkdown: () => void;
  themeMode: ThemeMode;
}) {
  return (
    <div className="modang-toolbar">
      <div className="group">
        <strong>墨档</strong>
        <span className="modang-muted" style={{ fontSize: 12 }}>
          纯静态 · 本地存储
        </span>
      </div>

      <div className="group">
        <button className="modang-btn" onClick={props.onNewFile}>
          新建文件
        </button>
        <button className="modang-btn" onClick={props.onNewFolder}>
          新建文件夹
        </button>
        <button className="modang-btn" onClick={props.onRename}>
          重命名
        </button>
        <button className="modang-btn danger" onClick={props.onDelete}>
          删除
        </button>
        <button className="modang-btn" onClick={props.onMove}>
          移动到…
        </button>
        <button className="modang-btn" onClick={props.onExportMarkdown}>
          导出 Markdown
        </button>
        <button className="modang-btn" onClick={props.onOpenSettings}>
          设置（{props.themeMode}）
        </button>
      </div>
    </div>
  );
}
