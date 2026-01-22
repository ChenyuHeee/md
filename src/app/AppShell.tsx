import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileTree } from '../components/FileTree';
import { Splitter } from '../components/Splitter';
import { EditorPane } from '../components/EditorPane';
import { PreviewPane } from '../components/PreviewPane';
import { Toolbar } from '../components/Toolbar';
import { SettingsModal } from '../components/SettingsModal';
import { MoveDialog } from '../components/MoveDialog';
import type { Settings, ThemeMode } from '../types/models';
import {
  bootstrapWorkspace,
  loadFileText,
  saveFileText,
  updateLastOpenFileId,
  persistTree,
} from '../storage/workspace';
import {
  createFile,
  createFolder,
  collectSubtreeFileIds,
  deleteNode,
  moveNode,
  renameNode,
  resolveParentFolderId,
  type TreeState,
} from '../storage/tree';
import { loadSettings, saveSettings, setThemeMode } from '../storage/settings';
import { useTheme } from './useTheme';
import { deleteFileContent } from '../storage/db';

function debounce<T extends (...args: any[]) => void>(fn: T, waitMs: number) {
  let t: number | null = null;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), waitMs);
  };
}

function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AppShell() {
  const [booted, setBooted] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const themeMode = settings.themeMode;
  const { resolvedTheme } = useTheme(themeMode);

  const [tree, setTree] = useState<TreeState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const [showSettings, setShowSettings] = useState(false);
  const [showMove, setShowMove] = useState(false);

  const widths = settings.ui ?? {};
  const [leftWidth, setLeftWidth] = useState(widths.leftWidth ?? 260);
  const [centerWidth, setCenterWidth] = useState(widths.centerWidth ?? 520);
  const [rightWidth, setRightWidth] = useState(widths.rightWidth ?? 420);

  // bootstrap
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const boot = await bootstrapWorkspace();
      if (cancelled) return;
      setSettings(boot.settings);
      setTree(boot.tree);
      setSelectedId(boot.currentFileId);
      setCurrentFileId(boot.currentFileId);
      setExpanded(new Set([boot.tree.rootId]));
      setBooted(true);

      const text = await loadFileText(boot.currentFileId);
      if (cancelled) return;
      setContent(text);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistUiWidths = useMemo(
    () =>
      debounce((l: number, c: number, r: number) => {
        const next: Settings = {
          ...loadSettings(),
          ui: { leftWidth: l, centerWidth: c, rightWidth: r },
        };
        saveSettings(next);
      }, 200),
    [],
  );

  useEffect(() => {
    persistUiWidths(leftWidth, centerWidth, rightWidth);
  }, [centerWidth, leftWidth, rightWidth, persistUiWidths]);

  const debouncedSave = useMemo(
    () =>
      debounce((fileId: string, nextContent: string) => {
        saveFileText(fileId, nextContent).catch(() => {
          // TODO: surface error to UI
        });
      }, 450),
    [],
  );

  const onChangeContent = useCallback(
    (next: string) => {
      setContent(next);
      if (currentFileId) debouncedSave(currentFileId, next);
    },
    [currentFileId, debouncedSave],
  );

  const openFile = useCallback(
    async (fileId: string) => {
      if (!tree) return;
      const node = tree.nodes[fileId];
      if (!node || node.type !== 'file') return;

      setSelectedId(fileId);
      setCurrentFileId(fileId);
      updateLastOpenFileId(fileId);
      const text = await loadFileText(fileId);
      setContent(text);
    },
    [tree],
  );

  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (!tree) return;
      const node = tree.nodes[id];
      if (node?.type === 'folder') return;
      void openFile(id);
    },
    [openFile, tree],
  );

  const onToggleFolder = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const requireTree = (): TreeState => {
    if (!tree) throw new Error('Tree not ready');
    return tree;
  };

  const requireSelected = (): string => {
    if (!selectedId) throw new Error('No selection');
    return selectedId;
  };

  const doNewFile = useCallback(async () => {
    const t = requireTree();
    const parentId = resolveParentFolderId(t, selectedId);
    const name = prompt('新建文件名（例如 note.md）', 'untitled.md');
    if (!name) return;

    const { tree: nextTree, id } = createFile(t, parentId, name);
    setTree(nextTree);
    persistTree(nextTree);

    // ensure folder expanded
    setExpanded((prev) => new Set(prev).add(parentId));

    await saveFileText(id, '');
    await openFile(id);
  }, [openFile, selectedId, tree]);

  const doNewFolder = useCallback(() => {
    const t = requireTree();
    const parentId = resolveParentFolderId(t, selectedId);
    const name = prompt('新建文件夹名', 'New Folder');
    if (!name) return;

    const { tree: nextTree, id } = createFolder(t, parentId, name);
    setTree(nextTree);
    persistTree(nextTree);
    setExpanded((prev) => new Set(prev).add(parentId).add(id));
  }, [selectedId, tree]);

  const doRename = useCallback(() => {
    const t = requireTree();
    const id = requireSelected();
    const node = t.nodes[id];
    if (!node) return;

    const nextName = prompt('重命名', node.name);
    if (!nextName || nextName === node.name) return;

    const nextTree = renameNode(t, id, nextName);
    setTree(nextTree);
    persistTree(nextTree);
  }, [selectedId, tree]);

  const doDelete = useCallback(() => {
    const t = requireTree();
    const id = requireSelected();
    const node = t.nodes[id];
    if (!node) return;
    if (!node.parentId) return;

    const ok = confirm(`确定删除：${node.name} ？（文件夹将递归删除）`);
    if (!ok) return;

    const fileIdsToDelete = collectSubtreeFileIds(t, id);

    const { tree: nextTree, deletedIds } = deleteNode(t, id);
    setTree(nextTree);
    persistTree(nextTree);

    Promise.all(fileIdsToDelete.map((fid) => deleteFileContent(fid))).catch(() => {
      // TODO: surface error to UI
    });

    if (currentFileId && deletedIds.includes(currentFileId)) {
      setCurrentFileId(null);
      setContent('');
    }

    setSelectedId(nextTree.rootId);
  }, [currentFileId, selectedId, tree]);

  const doMoveTo = useCallback(
    (folderId: string) => {
      const t = requireTree();
      const id = requireSelected();
      try {
        const nextTree = moveNode(t, id, folderId);
        setTree(nextTree);
        persistTree(nextTree);
        setExpanded((prev) => new Set(prev).add(folderId));
      } catch (e) {
        alert((e as Error).message);
      }
    },
    [selectedId, tree],
  );

  const doExportMarkdown = useCallback(() => {
    if (!tree || !currentFileId) return;
    const node = tree.nodes[currentFileId];
    const name = node?.name || 'export.md';
    downloadText(name, content, 'text/markdown;charset=utf-8');

    // TODO: 导出 HTML
    // TODO: 导出 PDF
  }, [content, currentFileId, tree]);

  const onChangeTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      const next = loadSettings();
      setSettings(next);
    },
    [setSettings],
  );

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  if (!booted || !tree) {
    return (
      <div className="modang-app">
        <div className="modang-toolbar">
          <div className="group">
            <strong>墨档</strong>
            <span className="modang-muted" style={{ fontSize: 12 }}>
              正在初始化…
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modang-app">
      <Toolbar
        onNewFile={doNewFile}
        onNewFolder={doNewFolder}
        onRename={doRename}
        onDelete={doDelete}
        onMove={() => setShowMove(true)}
        onOpenSettings={() => setShowSettings(true)}
        onExportMarkdown={doExportMarkdown}
        themeMode={themeMode}
      />

      <div className="modang-layout">
        <div className="modang-pane" style={{ width: leftWidth }}>
          <div className="pane-title">文件</div>
          <div className="pane-body">
            <FileTree
              tree={tree}
              selectedId={selectedId}
              expanded={expanded}
              onToggleFolder={onToggleFolder}
              onSelect={onSelect}
            />
          </div>
        </div>

        <Splitter
          onDelta={(dx) => {
            const next = clamp(leftWidth + dx, 180, 520);
            setLeftWidth(next);
          }}
        />

        <div className="modang-pane" style={{ width: centerWidth, flex: 1 }}>
          <div className="pane-title">编辑</div>
          <div className="pane-body">
            <EditorPane
              value={content}
              onChange={onChangeContent}
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
            />
          </div>
        </div>

        <Splitter
          onDelta={(dx) => {
            const next = clamp(rightWidth - dx, 240, 900);
            setRightWidth(next);
          }}
        />

        <div className="modang-pane" style={{ width: rightWidth }}>
          <div className="pane-title">预览</div>
          <div className="pane-body">
            <PreviewPane markdown={content} />
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          themeMode={themeMode}
          onChangeTheme={onChangeTheme}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showMove && selectedId && (
        <MoveDialog
          tree={tree}
          currentId={selectedId}
          onMoveTo={doMoveTo}
          onClose={() => setShowMove(false)}
        />
      )}
    </div>
  );
}
