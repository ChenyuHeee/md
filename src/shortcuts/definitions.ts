export type ShortcutScope = 'global' | 'fileTree' | 'editor';

export type ShortcutActionId =
  | 'ui.toggleFileTree'
  | 'ui.togglePreview'
  | 'ui.showSettings'
  | 'fmt.h1'
  | 'fmt.h2'
  | 'fmt.h3'
  | 'fmt.h4'
  | 'fmt.bold'
  | 'fmt.italic'
  | 'fmt.underline'
  | 'fmt.strike'
  | 'fmt.code'
  | 'fmt.codeBlock'
  | 'fmt.quote'
  | 'fmt.ul'
  | 'fmt.ol'
  | 'fmt.link'
  | 'fmt.image'
  | 'fmt.task'
  | 'fmt.table'
  | 'fmt.hr'
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
  { id: 'ui.toggleFileTree', scope: 'global', labelKey: 'shortcut.toggleFileTree', defaultBinding: 'Mod+\\' },
  { id: 'ui.togglePreview', scope: 'global', labelKey: 'shortcut.togglePreview', defaultBinding: 'Mod+P' },
  { id: 'ui.showSettings', scope: 'global', labelKey: 'shortcut.showSettings', defaultBinding: 'Mod+,' },

  // Editor scoped: markdown syntax helpers
  { id: 'fmt.h1', scope: 'editor', labelKey: 'fmt.h1', defaultBinding: 'Mod+Alt+1' },
  { id: 'fmt.h2', scope: 'editor', labelKey: 'fmt.h2', defaultBinding: 'Mod+Alt+2' },
  { id: 'fmt.h3', scope: 'editor', labelKey: 'fmt.h3', defaultBinding: 'Mod+Alt+3' },
  { id: 'fmt.h4', scope: 'editor', labelKey: 'fmt.h4', defaultBinding: 'Mod+Alt+4' },
  { id: 'fmt.bold', scope: 'editor', labelKey: 'fmt.bold', defaultBinding: 'Mod+B' },
  { id: 'fmt.italic', scope: 'editor', labelKey: 'fmt.italic', defaultBinding: 'Mod+I' },
  { id: 'fmt.underline', scope: 'editor', labelKey: 'fmt.underline', defaultBinding: 'Mod+Shift+U' },
  { id: 'fmt.strike', scope: 'editor', labelKey: 'fmt.strike', defaultBinding: 'Mod+Shift+X' },
  { id: 'fmt.code', scope: 'editor', labelKey: 'fmt.code', defaultBinding: 'Mod+`' },
  { id: 'fmt.codeBlock', scope: 'editor', labelKey: 'fmt.codeBlock', defaultBinding: 'Mod+Alt+C' },
  { id: 'fmt.quote', scope: 'editor', labelKey: 'fmt.quote', defaultBinding: 'Mod+Alt+Q' },
  { id: 'fmt.ul', scope: 'editor', labelKey: 'fmt.ul', defaultBinding: 'Mod+Alt+L' },
  { id: 'fmt.ol', scope: 'editor', labelKey: 'fmt.ol', defaultBinding: 'Mod+Alt+Shift+L' },
  { id: 'fmt.link', scope: 'editor', labelKey: 'fmt.link', defaultBinding: 'Mod+K' },
  { id: 'fmt.image', scope: 'editor', labelKey: 'fmt.image', defaultBinding: 'Mod+Alt+I' },
  { id: 'fmt.task', scope: 'editor', labelKey: 'fmt.task', defaultBinding: 'Mod+Alt+T' },
  { id: 'fmt.table', scope: 'editor', labelKey: 'fmt.table', defaultBinding: 'Mod+Alt+Shift+T' },
  { id: 'fmt.hr', scope: 'editor', labelKey: 'fmt.hr', defaultBinding: 'Mod+Alt+-' },

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
