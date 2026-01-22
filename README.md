# 墨档（Modang）

纯前端静态在线 Markdown 编辑器：

- 不引入任何自建后端
- 数据只保存在你的浏览器本地（localStorage + IndexedDB）
- 支持多文件/文件夹树、Markdown 预览、代码高亮、粘贴图片到本地资产（`modang://asset/<id>`）

在线访问（Project Pages）：https://ChenyuHeee.github.io/md/

## 技术栈

- Vite + React + TypeScript
- 编辑器：Monaco Editor（`@monaco-editor/react`）
- 渲染：`markdown-it` + GFM 常用能力（表格/任务列表/删除线）
- 高亮：`highlight.js`
- 本地存储：
	- localStorage：设置、文件树元数据
	- IndexedDB：文件内容、图片 Blob

## 本地开发

```bash
npm i
npm run dev
```

说明：本项目把 Vite 的开发入口放在 `src/index.html`（见 `vite.config.ts` 的 `root: 'src'`）。

## 构建与预览

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages（Project Pages）

目标路径是 `https://ChenyuHeee.github.io/md/`，因此已在 `vite.config.ts` 中设置：

- `base: '/md/'`

并提供一键脚本把构建产物同步到仓库根目录（便于 Pages 直接 serve）：

```bash
npm run deploy:root
```

该脚本会把 `dist/` 里的以下内容同步到仓库根目录：

- `index.html`
- `404.html`（SPA fallback）
- `assets/`
- `.nojekyll`

然后把变更提交并推送到默认分支，GitHub Pages 选择 Project Pages 即可。

## 隐私说明

墨档是纯静态应用，不会上传或同步你的文档到任何服务器；所有内容仅存储在你当前浏览器的本地存储中。

## Roadmap（TODO）

- [ ] 拖拽移动文件/文件夹
- [ ] 导出 HTML / PDF
- [ ] 历史版本
