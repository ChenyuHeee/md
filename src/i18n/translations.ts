export type Language = 'zh-CN' | 'en';

export type I18nKey =
  | 'app.name'
  | 'status.localOnly'
  | 'status.charCount'
  | 'fileTree.error'
  | 'default.newFolderName'
  | 'toolbar.newFile'
  | 'toolbar.newFolder'
  | 'toolbar.openLocal'
  | 'toolbar.openLocalFolder'
  | 'toolbar.rename'
  | 'toolbar.delete'
  | 'toolbar.move'
  | 'toolbar.exportMd'
  | 'toolbar.settings'
  | 'pane.files'
  | 'pane.editor'
  | 'pane.preview'
  | 'status.init'
  | 'dialog.settings.title'
  | 'dialog.settings.language'
  | 'dialog.settings.theme'
  | 'dialog.settings.ignoreFrontmatter'
  | 'dialog.settings.privacyTitle'
  | 'dialog.settings.privacyBody'
  | 'dialog.settings.cancel'
  | 'dialog.settings.save'
  | 'dialog.move.title'
  | 'dialog.move.target'
  | 'dialog.move.cancel'
  | 'dialog.move.confirm'
  | 'dialog.move.todo'
  | 'prompt.newFile'
  | 'prompt.newFolder'
  | 'prompt.rename'
  | 'confirm.delete'
  | 'toast.todo'
  | 'export.menu'
  | 'export.includeHeader'
  | 'export.header.file'
  | 'export.header.exportedAt'
  | 'export.md'
  | 'export.html'
  | 'export.pdf'
  | 'export.popupBlocked'
  | 'theme.system'
  | 'theme.light'
  | 'theme.dark'
  | 'lang.zh'
  | 'lang.en'
  | 'ui.toggleFileTree'
  | 'ui.togglePreview'
  | 'ui.showPreview'
  | 'ui.showEditor'
  | 'fmt.toolbar'
  | 'fmt.h1'
  | 'fmt.h2'
  | 'fmt.bold'
  | 'fmt.italic'
  | 'fmt.underline'
  | 'fmt.strike'
  | 'fmt.code'
  | 'fmt.quote'
  | 'fmt.ul'
  | 'fmt.ol'
  | 'fmt.link';

export const translations: Record<Language, Record<I18nKey, string>> = {
  'zh-CN': {
    'app.name': '墨档',
    'status.localOnly': '仅本地存储',
    'status.charCount': '字数：{count}',
    'fileTree.error': '工作区损坏',
    'default.newFolderName': '新建文件夹',
    'toolbar.newFile': '新建文件',
    'toolbar.newFolder': '新建文件夹',
    'toolbar.openLocal': '打开本地文档',
    'toolbar.openLocalFolder': '导入文件夹',
    'toolbar.rename': '重命名',
    'toolbar.delete': '删除',
    'toolbar.move': '移动到…',
    'toolbar.exportMd': '导出',
    'toolbar.settings': '设置',
    'pane.files': '文件',
    'pane.editor': '编辑',
    'pane.preview': '预览',
    'status.init': '正在初始化…',
    'dialog.settings.title': '设置',
    'dialog.settings.language': '语言',
    'dialog.settings.theme': '主题',
    'dialog.settings.ignoreFrontmatter': '预览时忽略 Frontmatter（YAML）',
    'dialog.settings.privacyTitle': '隐私',
    'dialog.settings.privacyBody':
      '墨档是纯静态应用，不包含任何自建后端；所有数据仅保存在你的浏览器本地（localStorage + IndexedDB）。',
    'dialog.settings.cancel': '取消',
    'dialog.settings.save': '保存',
    'dialog.move.title': '移动到',
    'dialog.move.target': '目标文件夹',
    'dialog.move.cancel': '取消',
    'dialog.move.confirm': '移动',
    'dialog.move.todo': 'TODO：未来可支持拖拽移动。',
    'prompt.newFile': '新建文件名（例如 note）',
    'prompt.newFolder': '新建文件夹名',
    'prompt.rename': '重命名',
    'confirm.delete': '确定删除：{name}？（文件夹将递归删除）',
    'toast.todo': 'TODO：功能待实现',
    'export.menu': '导出…',
    'export.includeHeader': '包含页眉（标题 / 文件名 / 时间）',
    'export.header.file': '文件：',
    'export.header.exportedAt': '导出时间：',
    'export.md': '导出 Markdown',
    'export.html': '导出 HTML（含图片）',
    'export.pdf': '导出 PDF（打印）',
    'export.popupBlocked': '导出 PDF 需要打开新窗口。请允许弹窗后重试。',
    'theme.system': '跟随系统',
    'theme.light': '浅色',
    'theme.dark': '深色',
    'lang.zh': '中文',
    'lang.en': 'English',
    'ui.toggleFileTree': '文件列表',
    'ui.togglePreview': '预览面板',
    'ui.showPreview': '切换到预览',
    'ui.showEditor': '切换到编辑',
    'fmt.toolbar': '样式工具栏',
    'fmt.h1': '一级标题',
    'fmt.h2': '二级标题',
    'fmt.bold': '加粗',
    'fmt.italic': '斜体',
    'fmt.underline': '下划线',
    'fmt.strike': '删除线',
    'fmt.code': '行内代码',
    'fmt.quote': '引用',
    'fmt.ul': '无序列表',
    'fmt.ol': '有序列表',
    'fmt.link': '链接',
  },
  en: {
    'app.name': 'Modang',
    'status.localOnly': 'Local-only',
    'status.charCount': 'Chars: {count}',
    'fileTree.error': 'Workspace error',
    'default.newFolderName': 'New Folder',
    'toolbar.newFile': 'New File',
    'toolbar.newFolder': 'New Folder',
    'toolbar.openLocal': 'Open local file',
    'toolbar.openLocalFolder': 'Import folder',
    'toolbar.rename': 'Rename',
    'toolbar.delete': 'Delete',
    'toolbar.move': 'Move to…',
    'toolbar.exportMd': 'Export',
    'toolbar.settings': 'Settings',
    'pane.files': 'Files',
    'pane.editor': 'Editor',
    'pane.preview': 'Preview',
    'status.init': 'Initializing…',
    'dialog.settings.title': 'Settings',
    'dialog.settings.language': 'Language',
    'dialog.settings.theme': 'Theme',
    'dialog.settings.ignoreFrontmatter': 'Ignore frontmatter (YAML) in preview',
    'dialog.settings.privacyTitle': 'Privacy',
    'dialog.settings.privacyBody':
      'Modang is a purely static app with no custom backend. All data stays in your browser (localStorage + IndexedDB).',
    'dialog.settings.cancel': 'Cancel',
    'dialog.settings.save': 'Save',
    'dialog.move.title': 'Move to',
    'dialog.move.target': 'Destination folder',
    'dialog.move.cancel': 'Cancel',
    'dialog.move.confirm': 'Move',
    'dialog.move.todo': 'TODO: Drag & drop move.',
    'prompt.newFile': 'New file name (e.g., note)',
    'prompt.newFolder': 'New folder name',
    'prompt.rename': 'Rename',
    'confirm.delete': 'Delete: {name}? (Folders will be deleted recursively)',
    'toast.todo': 'TODO: Not implemented yet',
    'export.menu': 'Export…',
    'export.includeHeader': 'Include header (title / file / time)',
    'export.header.file': 'File: ',
    'export.header.exportedAt': 'Exported: ',
    'export.md': 'Export Markdown',
    'export.html': 'Export HTML (with images)',
    'export.pdf': 'Export PDF (Print)',
    'export.popupBlocked': 'PDF export needs a new window. Please allow pop-ups and retry.',
    'theme.system': 'System',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'lang.zh': '中文',
    'lang.en': 'English',
    'ui.toggleFileTree': 'Files',
    'ui.togglePreview': 'Preview panel',
    'ui.showPreview': 'Switch to preview',
    'ui.showEditor': 'Switch to editor',
    'fmt.toolbar': 'Formatting toolbar',
    'fmt.h1': 'Heading 1',
    'fmt.h2': 'Heading 2',
    'fmt.bold': 'Bold',
    'fmt.italic': 'Italic',
    'fmt.underline': 'Underline',
    'fmt.strike': 'Strikethrough',
    'fmt.code': 'Inline code',
    'fmt.quote': 'Blockquote',
    'fmt.ul': 'Bulleted list',
    'fmt.ol': 'Numbered list',
    'fmt.link': 'Link',
  },
};

export function format(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}
