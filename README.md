# xxybg.github.io

初音未来主题的个人博客。**零第三方依赖**：模板、样式、脚本、构建器全部手写，只用 Node.js 标准库。

- 站点：<https://xxybg.github.io>
- 主色：`#39C5BB`（初音的青绿）· 辅色 `#FF7FAE`（樱花粉）

## 目录结构

```
├── index.html                  → 生成的首页（GitHub Pages 直接读取）
├── 2026/10/17/<slug>/index.html → 生成的文章页
├── archives/  tags/  about/     → 生成的归档 / 标签 / 关于页
├── 404.html  atom.xml  sitemap.xml  robots.txt
├── assets/                     → 生成的静态资源（css / js / img / data）
└── _source/                    → 源文件，只在构建时使用
    ├── build.mjs               → 构建脚本
    ├── serve.mjs               → 本地预览服务器
    ├── site.config.mjs         → 站名、导航、首页文案、关于页
    ├── posts/*.md              → 文章（Markdown + front matter）
    ├── lib/                    → markdown 渲染、语法高亮、页面骨架
    ├── assets/                 → 源样式与素材（构建时复制到 /assets）
    └── tools/gen-art.mjs       → 生成头图 SVG 的脚本
```

## 常用命令

```bash
node _source/build.mjs          # 构建整站（约 100ms）
node _source/serve.mjs          # 本地预览 http://127.0.0.1:4321
node _source/serve.mjs --port 8080
```

## 写一篇新文章

在 `_source/posts/` 新建 `我的标题.md`，文件名就是 URL 里的别名：

```markdown
---
title: 我的标题
date: 2026-10-18 21:00:00
tags: [随笔, 初音未来]
summary: 首页卡片上显示的一段摘要（可省略，默认取正文前 96 字）。
---

正文从这里开始。支持标题、列表、表格、引用、代码块、`行内代码`：

::: tip 小提示
还可以用 `::: tip` / `::: note` / `::: miku` 写彩色提示块。
:::
```

构建后自动生成 `/年/月/日/我的标题/` 页面、归档、标签页和 RSS。

## 改文案

站名、副标题、导航、首页主视觉文案、关于页内容、页脚声明全在 `_source/site.config.mjs`，改完重新构建即可。

## 主题能力

- 昼 / 夜切换（记忆在 localStorage，默认夜）
- 首页：SVG 立绘 + 声波画布 + 打字机标语 + 文章卡片
- 文章页：阅读进度、自动目录、代码复制、上下篇
- 归档：年 / 月时间轴；标签：标签云 + 单标签页
- 响应式（桌面 / 平板 / 手机）、`prefers-reduced-motion` 降级、键盘可达
- 自写 Markdown 渲染器 + 语法高亮，支持提示块、表格、引用

## 部署

GitHub Pages 从 `main` 分支根目录发布，构建产物直接提交：

```bash
node _source/build.mjs
git add -A
git commit -m "post: 新文章"
git push origin main
```

`.nojekyll` 已包含，避免 Pages 用 Jekyll 处理站点目录。

## 版权

本站为个人爱好站点，与 Crypton Future Media 无关；初音未来及相关角色版权归其所有者。
站内插画为本站自行绘制的 SVG，可随本仓库一同使用。
