export type ShortcutScope = 'global' | 'fileTree';

export type ShortcutActionId =
  | 'ui.toggleFileTree'
  | 'ui.togglePreview'
  | 'ui.showSettings'
  | 'file.new'
  | 'folder.new'
  | 'node.rename'
  | 'node.delete'
  | 'node.move'
  | 'file.openLocal'
  | 'file.importFolder'
  | 'file.saveToLocal'
  | 'export.md'
  | 'export.html'
  | 'export.pdf';

export type ShortcutActionDef = {
  id: ShortcutActionId;
  scope: ShortcutScope;
  labelKey: string;
  defaultBinding: string;
};

export const SHORTCUT_DEFS: ShortcutActionDef[] = [
  { id: 'ui.toggleFileTree', scope: 'global', labelKey: 'shortcut.toggleFileTree', defaultBinding: 'Mod+B' },
  { id: 'ui.togglePreview', scope: 'global', labelKey: 'shortcut.togglePreview', defaultBinding: 'Mod+P' },
  { id: 'ui.showSettings', scope: 'global', labelKey: 'shortcut.showSettings', defaultBinding: 'Mod+,' },

  { id: 'file.new', scope: 'global', labelKey: 'shortcut.newFile', defaultBinding: 'Mod+N' },
  { id: 'folder.new', scope: 'global', labelKey: 'shortcut.newFolder', defaultBinding: 'Mod+Shift+N' },

  // File tree scoped (won't fire while typing in editor)
  { id: 'node.rename', scope: 'fileTree', labelKey: 'shortcut.rename', defaultBinding: 'Enter' },
  { id: 'node.delete', scope: 'fileTree', labelKey: 'shortcut.delete', defaultBinding: 'Mod+Backspace' },
  { id: 'node.move', scope: 'fileTree', labelKey: 'shortcut.move', defaultBinding: 'Mod+M' },

  { id: 'file.openLocal', scope: 'global', labelKey: 'shortcut.openLocal', defaultBinding: 'Mod+O' },
  { id: 'file.importFolder', scope: 'global', labelKey: 'shortcut.importFolder', defaultBinding: 'Mod+Shift+O' },
  { id: 'file.saveToLocal', scope: 'global', labelKey: 'shortcut.saveToLocal', defaultBinding: 'Mod+S' },

  { id: 'export.md', scope: 'global', labelKey: 'shortcut.exportMd', defaultBinding: 'Mod+Shift+S' },
  { id: 'export.html', scope: 'global', labelKey: 'shortcut.exportHtml', defaultBinding: 'Mod+Alt+S' },
  { id: 'export.pdf', scope: 'global', labelKey: 'shortcut.exportPdf', defaultBinding: 'Mod+Alt+P' },
];

export const SHORTCUT_ACTION_IDS: ShortcutActionId[] = SHORTCUT_DEFS.map((d) => d.id);

export function getDefaultShortcutBinding(id: ShortcutActionId): string {
  return SHORTCUT_DEFS.find((d) => d.id === id)?.defaultBinding ?? '';
}

export function getShortcutScope(id: ShortcutActionId): ShortcutScope {
  return SHORTCUT_DEFS.find((d) => d.id === id)?.scope ?? 'global';
}
