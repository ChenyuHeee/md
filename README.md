# 墨档（Modang）

![license](https://img.shields.io/badge/license-MIT-blue.svg)
![vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![react](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=000)
![ts](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

纯前端、零后端的 Markdown 编辑器：像桌面应用一样好用，但所有数据只留在你的浏览器本地。

在线体验（GitHub Pages / Project Pages）：
https://ChenyuHeee.github.io/md/

---

## 特性

- 纯静态应用：不引入任何自建后端，不上传、不同步
- 编辑体验：Monaco Editor（接近 VS Code 的编辑体验）
- 预览渲染：Markdown 预览 + 代码高亮（浅色/深色自动适配）
- 工作区：多文件/文件夹树
- 图片资产：支持粘贴图片，自动保存为本地资产并在 Markdown 中引用（`modang://asset/<id>`）
- 本地文件工作流
	- 打开本地 Markdown 文件导入到工作区
	- 导入文件夹（保留目录结构）
	- 可选绑定到磁盘文件：支持后续自动写回（取决于浏览器能力与授权）
- 可配置快捷键：在“设置 → 快捷键”里录制/清空/重置
- 预览细节：可选忽略 YAML Frontmatter（默认开启）
- 导出：支持导出 Markdown / HTML / PDF（打印）

---

## 截图

> 你也可以在 Issue / PR 里直接引用这些图。

<table>
	<tr>
		<td align="center"><strong>快捷键设置</strong></td>
		<td align="center"><strong>应用截图</strong></td>
	</tr>
	<tr>
		<td>
			<img alt="快捷键设置" src="assets/img/%E5%BF%AB%E6%8D%B7%E9%94%AE.png" width="420" />
		</td>
		<td>
			<img alt="应用截图" src="assets/img/%E6%88%AA%E5%9B%BE.png" width="420" />
		</td>
	</tr>
</table>

---

## 快速开始

### 环境要求

- Node.js（建议 18+）

### 安装依赖

```bash
npm i
```

### 本地开发

```bash
npm run dev
```

说明：项目把 Vite 的入口放在 `src/`（`vite.config.ts` 中设置了 `root: 'src'`）。

### 构建与预览

```bash
npm run build
npm run preview
```

---

## 使用指南

### 工作区与存储

- 文件树与设置：存储在 `localStorage`
- 文档内容与图片 Blob：存储在 `IndexedDB`

### 打开本地文件 / 导入文件夹

- “打开本地文档”：把本地文件导入到工作区，并保存到浏览器本地存储
- “导入文件夹”：递归导入目录并保留结构

### 保存到本地文件（绑定磁盘）

如果浏览器支持 File System Access API，你可以把当前文档绑定到磁盘上的一个文件：

- 绑定后，后续编辑会尝试自动写回（需要读写权限）
- 若浏览器不支持或未授权，墨档仍会正常把数据保存到浏览器本地（只是无法写回磁盘文件）

---

## 快捷键

- 支持全局动作与“文件树作用域”动作
- 在设置里点击输入框后按下组合键即可录制
- 录制为空表示禁用该动作；可一键重置为默认

---

## 浏览器兼容性

- 核心功能（编辑/预览/本地存储）在现代浏览器中可用
- “写回磁盘文件 / 目录选择器”依赖 File System Access API：
	- Chromium 系（Chrome / Edge 等）支持更完整
	- 其他浏览器会自动降级为导入/下载快照等方式

---

## 部署到 GitHub Pages（Project Pages）

本项目默认部署到 `https://ChenyuHeee.github.io/md/`，因此在 `vite.config.ts` 中设置了：

- `base: '/md/'`

一键构建并把产物同步到仓库根目录（便于 Pages 直接 serve）：

```bash
npm run deploy:root
```

脚本会把 `dist/` 中的以下内容同步到仓库根目录：

- `index.html`
- `404.html`（SPA fallback）
- `assets/`
- `.nojekyll`

然后提交并推送到默认分支即可。

---

## 隐私

墨档是纯静态应用：

- 不包含任何自建后端
- 不会上传或同步你的文档到任何服务器
- 所有数据只存储在你当前浏览器的本地存储中

---

## Roadmap

- [ ] 拖拽移动文件/文件夹
- [ ] 历史版本 / 快照
- [ ] 更强的快捷键体验（冲突提示、搜索过滤、导入导出配置）

---

## 贡献

欢迎 PR / Issue：

- Bug：请附上复现步骤、浏览器版本、截图/录屏
- 功能建议：说明使用场景与期望交互

开发常用命令：

```bash
npm run lint
npm run format
```

---

## 致谢

- Monaco Editor
- markdown-it
- highlight.js
- idb

---

## License

MIT License。详见 `LICENSE`。
