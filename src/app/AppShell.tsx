import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FilePlus2,
  FolderPlus,
  Pencil,
  Trash2,
  MoveRight,
  Download,
  Settings as SettingsIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from 'lucide-react';
import { FileTree } from '../components/FileTree';
import { Splitter } from '../components/Splitter';
import { EditorPane } from '../components/EditorPane';
import { PreviewPane } from '../components/PreviewPane';
import { SettingsModal } from '../components/SettingsModal';
import { MoveDialog } from '../components/MoveDialog';
import { IconButton } from '../components/ui/Button';
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
  getAncestorFolderIds,
  moveNode,
  renameNode,
  resolveParentFolderId,
  type TreeState,
} from '../storage/tree';
import { loadSettings, saveSettings, setThemeMode } from '../storage/settings';
import { useTheme } from './useTheme';
import { deleteFileContent } from '../storage/db';
import { useI18n } from '../i18n/useI18n';
import type { Language } from '../i18n/translations';
import { stripFileExtensionForDisplay } from '../utils/filename';
import {
  buildExportHtmlDocument,
  openPrintWindow,
  renderMarkdownHtmlWithInlinedAssets,
} from '../export/export';
import type { editor as MonacoEditor } from 'monaco-editor';

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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pickDocTitle(markdown: string, fallback: string) {
  const m = (markdown || '').match(/^\s*#\s+(.+)\s*$/m);
  return (m?.[1]?.trim() || fallback).slice(0, 160);
}

function ensureExtension(name: string, ext: string) {
  if (name.toLowerCase().endsWith(ext.toLowerCase())) return name;
  // Only append when there is no extension at all.
  if (/\.[a-z0-9]+$/i.test(name)) return name;
  return `${name}${ext}`;
}

export function AppShell() {
  const [booted, setBooted] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const themeMode = settings.themeMode;
  const { resolvedTheme } = useTheme(themeMode);
  const language = (settings.language ?? 'zh-CN') as Language;
  const { t } = useI18n(language);
  const exportIncludeHeader = settings.export?.includeHeader ?? true;

  const [tree, setTree] = useState<TreeState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);

  const currentDisplayName = useMemo(() => {
    if (!tree || !currentFileId) return '';
    const node = tree.nodes[currentFileId];
    if (!node || node.type !== 'file') return '';
    return stripFileExtensionForDisplay(node.name);
  }, [currentFileId, tree]);

  const charCount = useMemo(() => {
    const withoutWhitespace = (content ?? '').replace(/\s/g, '');
    return Array.from(withoutWhitespace).length;
  }, [content]);

  const [showSettings, setShowSettings] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

      const persistedExpanded = boot.settings.ui?.expandedFolderIds ?? [boot.tree.rootId];
      const autoExpand = getAncestorFolderIds(boot.tree, boot.currentFileId);
      setExpanded(new Set([boot.tree.rootId, ...persistedExpanded, ...autoExpand]));

      setBooted(true);

      const text = await loadFileText(boot.currentFileId);
      if (cancelled) return;
      setContent(text);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      const el = document.getElementById('exportMenuWrap');
      if (!el || !target) return;
      if (!el.contains(target)) setShowExportMenu(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [showExportMenu]);

  const persistUiWidths = useMemo(
    () =>
      debounce((l: number, c: number, r: number) => {
        const cur = loadSettings();
        const next: Settings = {
          ...cur,
          ui: { ...(cur.ui ?? {}), leftWidth: l, centerWidth: c, rightWidth: r },
        };
        saveSettings(next);
      }, 200),
    [],
  );

  const persistExpandedFolders = useMemo(
    () =>
      debounce((expandedIds: string[]) => {
        const cur = loadSettings();
        const next: Settings = {
          ...cur,
          ui: { ...(cur.ui ?? {}), expandedFolderIds: expandedIds },
        };
        saveSettings(next);
      }, 120),
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

  const applyWrap = useCallback(
    (prefix: string, suffix: string) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getSelection();
      const pos = editor.getPosition();
      const range =
        selection ??
        (pos
          ? {
              startLineNumber: pos.lineNumber,
              startColumn: pos.column,
              endLineNumber: pos.lineNumber,
              endColumn: pos.column,
            }
          : model.getFullModelRange());

      const selectedText = model.getValueInRange(range);
      const isEmpty = !selectedText;
      const text = isEmpty ? `${prefix}${suffix}` : `${prefix}${selectedText}${suffix}`;

      editor.executeEdits('modang-format', [{ range, text, forceMoveMarkers: true }]);

      // Put cursor inside the wrapper when nothing selected.
      if (isEmpty) {
        editor.setSelection({
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn + prefix.length,
          endLineNumber: range.startLineNumber,
          endColumn: range.startColumn + prefix.length,
        });
      }

      editor.focus();
      onChangeContent(editor.getValue());
    },
    [editor, onChangeContent],
  );

  const applyHeading = useCallback(
    (level: 1 | 2) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getSelection();
      const pos = editor.getPosition();
      const startLine = selection?.startLineNumber ?? pos?.lineNumber ?? 1;
      const endLine = selection?.endLineNumber ?? pos?.lineNumber ?? startLine;

      const prefix = `${'#'.repeat(level)} `;
      const edits: MonacoEditor.IIdentifiedSingleEditOperation[] = [];

      for (let line = startLine; line <= endLine; line++) {
        const lineText = model.getLineContent(line);
        const nextLine = lineText.replace(/^#{1,6}\s+/, '');
        const already = lineText.startsWith(prefix);
        const finalText = already ? nextLine : `${prefix}${nextLine}`;
        edits.push({
          range: {
            startLineNumber: line,
            startColumn: 1,
            endLineNumber: line,
            endColumn: lineText.length + 1,
          },
          text: finalText,
          forceMoveMarkers: true,
        });
      }

      editor.executeEdits('modang-format', edits);
      editor.focus();
      onChangeContent(editor.getValue());
    },
    [editor, onChangeContent],
  );

  const openFile = useCallback(
    async (fileId: string) => {
      if (!tree) return;
      const node = tree.nodes[fileId];
      if (!node || node.type !== 'file') return;

      // Ensure folder path is expanded so the file remains visible after reload.
      const ancestors = getAncestorFolderIds(tree, fileId);
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(tree.rootId);
        for (const fid of ancestors) next.add(fid);
        persistExpandedFolders([...next]);
        return next;
      });

      setSelectedId(fileId);
      setCurrentFileId(fileId);
      updateLastOpenFileId(fileId);
      const text = await loadFileText(fileId);
      setContent(text);
    },
    [persistExpandedFolders, tree],
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

      // Always keep root expanded; and persist.
      if (tree) next.add(tree.rootId);
      persistExpandedFolders([...next]);
      return next;
    });
  }, [persistExpandedFolders, tree]);

  const requireTree = (): TreeState => {
    if (!tree) throw new Error('Tree not ready');
    return tree;
  };

  const requireSelected = (): string => {
    if (!selectedId) throw new Error('No selection');
    return selectedId;
  };

  const doNewFile = useCallback(async () => {
    const treeState = requireTree();
    const parentId = resolveParentFolderId(treeState, selectedId);
    const name = prompt(t('prompt.newFile'), 'untitled');
    if (!name) return;

    const { tree: nextTree, id } = createFile(treeState, parentId, name);
    setTree(nextTree);
    persistTree(nextTree);

    // ensure folder expanded
    setExpanded((prev) => new Set(prev).add(parentId));

    await saveFileText(id, '');
    await openFile(id);
  }, [openFile, selectedId, tree, t]);

  const doNewFolder = useCallback(() => {
    const treeState = requireTree();
    const parentId = resolveParentFolderId(treeState, selectedId);
    const name = prompt(t('prompt.newFolder'), t('default.newFolderName'));
    if (!name) return;

    const { tree: nextTree, id } = createFolder(treeState, parentId, name);
    setTree(nextTree);
    persistTree(nextTree);
    setExpanded((prev) => new Set(prev).add(parentId).add(id));
  }, [selectedId, tree, t]);

  const doRename = useCallback(() => {
    const treeState = requireTree();
    const id = requireSelected();
    const node = treeState.nodes[id];
    if (!node) return;

    const defaultName = node.type === 'file' ? stripFileExtensionForDisplay(node.name) : node.name;
    const nextName = prompt(t('prompt.rename'), defaultName);
    if (!nextName || nextName === node.name) return;

    const nextTree = renameNode(treeState, id, nextName);
    setTree(nextTree);
    persistTree(nextTree);
  }, [selectedId, tree, t]);

  const doDelete = useCallback(() => {
    const treeState = requireTree();
    const id = requireSelected();
    const node = treeState.nodes[id];
    if (!node) return;
    if (!node.parentId) return;

    const displayName = node.type === 'file' ? stripFileExtensionForDisplay(node.name) : node.name;
    const ok = confirm(t('confirm.delete', { name: displayName }));
    if (!ok) return;

    const fileIdsToDelete = collectSubtreeFileIds(treeState, id);

    const { tree: nextTree, deletedIds } = deleteNode(treeState, id);
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
  }, [currentFileId, selectedId, tree, t]);

  const doMoveTo = useCallback(
    (folderId: string) => {
      const treeState = requireTree();
      const id = requireSelected();
      try {
        const nextTree = moveNode(treeState, id, folderId);
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
    const rawName = node?.name || 'export';
    const name = ensureExtension(rawName, '.md');
    downloadText(name, content, 'text/markdown;charset=utf-8');
  }, [content, currentFileId, tree]);

  const doExportHtml = useCallback(async () => {
    if (!tree || !currentFileId) return;
    const node = tree.nodes[currentFileId];
    const baseName = node?.name || 'export.md';

    const htmlName = baseName.toLowerCase().endsWith('.md')
      ? baseName.replace(/\.md$/i, '.html')
      : baseName.endsWith('.html')
        ? baseName
        : `${baseName}.html`;

    const now = new Date();
    const locale = language === 'en' ? 'en-US' : 'zh-CN';
    const exportedAt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(now);

    const fallbackTitle = stripFileExtensionForDisplay(baseName);
    const docTitle = pickDocTitle(content, fallbackTitle);

    const headerHtml = exportIncludeHeader
      ? `<header class="exportHeader">
          <div class="exportHeaderTitle">${escapeHtml(docTitle)}</div>
          <div class="exportHeaderMeta">
            <div class="exportHeaderMetaRow"><span class="exportHeaderKey">${escapeHtml(t('export.header.file'))}</span><span class="exportHeaderVal">${escapeHtml(stripFileExtensionForDisplay(baseName))}</span></div>
            <div class="exportHeaderMetaRow"><span class="exportHeaderKey">${escapeHtml(t('export.header.exportedAt'))}</span><span class="exportHeaderVal">${escapeHtml(exportedAt)}</span></div>
          </div>
        </header>`
      : undefined;

    const bodyHtml = await renderMarkdownHtmlWithInlinedAssets(content);
    const doc = buildExportHtmlDocument({
      title: docTitle,
      bodyHtml,
      headerHtml,
      lang: language === 'en' ? 'en' : 'zh-CN',
    });
    downloadText(htmlName, doc, 'text/html;charset=utf-8');
  }, [content, currentFileId, exportIncludeHeader, language, t, tree]);

  const doExportPdf = useCallback(async () => {
    if (!tree || !currentFileId) return;
    const node = tree.nodes[currentFileId];
    const baseName = node?.name || 'export.md';

    const now = new Date();
    const locale = language === 'en' ? 'en-US' : 'zh-CN';
    const exportedAt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(now);

    const fallbackTitle = stripFileExtensionForDisplay(baseName);
    const docTitle = pickDocTitle(content, fallbackTitle);

    const headerHtml = exportIncludeHeader
      ? `<header class="exportHeader">
          <div class="exportHeaderTitle">${escapeHtml(docTitle)}</div>
          <div class="exportHeaderMeta">
            <div class="exportHeaderMetaRow"><span class="exportHeaderKey">${escapeHtml(t('export.header.file'))}</span><span class="exportHeaderVal">${escapeHtml(stripFileExtensionForDisplay(baseName))}</span></div>
            <div class="exportHeaderMetaRow"><span class="exportHeaderKey">${escapeHtml(t('export.header.exportedAt'))}</span><span class="exportHeaderVal">${escapeHtml(exportedAt)}</span></div>
          </div>
        </header>`
      : undefined;

    const bodyHtml = await renderMarkdownHtmlWithInlinedAssets(content);
    const doc = buildExportHtmlDocument({
      title: docTitle,
      bodyHtml,
      headerHtml,
      lang: language === 'en' ? 'en' : 'zh-CN',
    });
    const ok = openPrintWindow(doc);
    if (!ok) alert(t('export.popupBlocked'));
  }, [content, currentFileId, exportIncludeHeader, language, t, tree]);

  const onToggleExportHeader = useCallback(
    (nextValue: boolean) => {
      const next = loadSettings();
      next.export = { ...(next.export ?? {}), includeHeader: nextValue };
      saveSettings(next);
      setSettings(next);
    },
    [setSettings],
  );

  const onChangeTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      const next = loadSettings();
      setSettings(next);
    },
    [setSettings],
  );

  const onChangeLanguage = useCallback(
    (lang: Language) => {
      const next: Settings = { ...loadSettings(), language: lang };
      saveSettings(next);
      setSettings(next);
    },
    [setSettings],
  );

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  if (!booted || !tree) {
    return (
      <div className="appRoot">
        <div className="topbar">
          <div className="brand">
            <div className="brandMark" />
            <div>{t('app.name')}</div>
            <div className="subtle">{t('status.init')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appRoot">
      <div className="topbar">
        <div className="brand">
          <div className="brandMark" />
          <div>{t('app.name')}</div>
          <div className="subtle">{t('status.localOnly')}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconButton icon={<FilePlus2 size={18} />} label={t('toolbar.newFile')} onClick={doNewFile} />
          <IconButton icon={<FolderPlus size={18} />} label={t('toolbar.newFolder')} onClick={doNewFolder} />
          <IconButton icon={<Pencil size={18} />} label={t('toolbar.rename')} onClick={doRename} />
          <IconButton
            icon={<Trash2 size={18} />}
            label={t('toolbar.delete')}
            onClick={doDelete}
            className="ui-iconBtn--danger"
          />
          <IconButton icon={<MoveRight size={18} />} label={t('toolbar.move')} onClick={() => setShowMove(true)} />
          <div id="exportMenuWrap" style={{ position: 'relative' }}>
            <IconButton
              icon={<Download size={18} />}
              label={t('export.menu')}
              onClick={() => setShowExportMenu((v) => !v)}
            />
            {showExportMenu ? (
              <div className="menu" role="menu" aria-label={t('export.menu')}>
                <label className="menuItem menuItemToggle">
                  <input
                    className="menuCheck"
                    type="checkbox"
                    checked={exportIncludeHeader}
                    onChange={(e) => onToggleExportHeader(e.target.checked)}
                  />
                  <span>{t('export.includeHeader')}</span>
                </label>
                <div className="menuSep" />
                <button
                  type="button"
                  className="menuItem"
                  onClick={() => {
                    doExportMarkdown();
                    setShowExportMenu(false);
                  }}
                >
                  {t('export.md')}
                </button>
                <button
                  type="button"
                  className="menuItem"
                  onClick={() => {
                    void doExportHtml();
                    setShowExportMenu(false);
                  }}
                >
                  {t('export.html')}
                </button>
                <button
                  type="button"
                  className="menuItem"
                  onClick={() => {
                    void doExportPdf();
                    setShowExportMenu(false);
                  }}
                >
                  {t('export.pdf')}
                </button>
              </div>
            ) : null}
          </div>
          <IconButton
            icon={<SettingsIcon size={18} />}
            label={t('toolbar.settings')}
            onClick={() => setShowSettings(true)}
          />
        </div>
      </div>

      <div className="workspace">
        <div className="shell">
          <div className="paneCard" style={{ width: leftWidth }}>
            <div className="paneHeader">
              <div className="paneTitle">{t('pane.files')}</div>
              <div className="subtle" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentDisplayName}
              </div>
            </div>
            <div className="paneBody">
              <FileTree
                tree={tree}
                selectedId={selectedId}
                expanded={expanded}
                language={language}
                onToggleFolder={onToggleFolder}
                onSelect={onSelect}
              />
            </div>
          </div>

          <Splitter
            onDelta={(dx) => {
              const next = clamp(leftWidth + dx, 200, 560);
              setLeftWidth(next);
            }}
          />

          <div className="paneCard" style={{ width: centerWidth, flex: 1 }}>
            <div className="paneHeader">
              <div className="paneTitle">{t('pane.editor')}</div>
            </div>
            <div className="paneBody paneBodyCol">
              <div className="editorToolbar" role="toolbar" aria-label={t('fmt.toolbar')}>
                <IconButton
                  icon={<span className="fmtTag">H1</span>}
                  label={t('fmt.h1')}
                  onClick={() => applyHeading(1)}
                />
                <IconButton
                  icon={<span className="fmtTag">H2</span>}
                  label={t('fmt.h2')}
                  onClick={() => applyHeading(2)}
                />
                <div className="editorToolbarSep" />
                <IconButton icon={<Bold size={18} />} label={t('fmt.bold')} onClick={() => applyWrap('**', '**')} />
                <IconButton icon={<Italic size={18} />} label={t('fmt.italic')} onClick={() => applyWrap('*', '*')} />
                <IconButton
                  icon={<Underline size={18} />}
                  label={t('fmt.underline')}
                  onClick={() => applyWrap('<u>', '</u>')}
                />
                <IconButton
                  icon={<Strikethrough size={18} />}
                  label={t('fmt.strike')}
                  onClick={() => applyWrap('~~', '~~')}
                />
              </div>
              <div className="editorWrap">
                <EditorPane
                  value={content}
                  onChange={onChangeContent}
                  onEditorMount={setEditor}
                  theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                />
              </div>
            </div>
          </div>

          <Splitter
            onDelta={(dx) => {
              const next = clamp(rightWidth - dx, 280, 980);
              setRightWidth(next);
            }}
          />

          <div className="paneCard" style={{ width: rightWidth }}>
            <div className="paneHeader">
              <div className="paneTitle">{t('pane.preview')}</div>
              <div className="subtle">{currentDisplayName || ''}</div>
            </div>
            <div className="paneBody">
              <div className="preview">
                <PreviewPane markdown={content} />
              </div>
            </div>
          </div>
        </div>

        <div className="statusBar">
          <div className="statusBarLeft">{t('status.charCount', { count: String(charCount) })}</div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          themeMode={themeMode}
          language={language}
          onChangeTheme={onChangeTheme}
          onChangeLanguage={onChangeLanguage}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showMove && selectedId && (
        <MoveDialog
          tree={tree}
          currentId={selectedId}
          language={language}
          onMoveTo={doMoveTo}
          onClose={() => setShowMove(false)}
        />
      )}
    </div>
  );
}
