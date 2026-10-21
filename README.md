# xxybg.github.io

初音未来主题的个人博客：**Hexo 8 + Butterfly 5.7**，上面套了一层自写的 Miku 皮肤。

- 站点：<https://xxybg.github.io>
- 主色：`#39C5BB`（初音的青绿）· 辅色 `#FF7FAE`（樱花粉）
- 皮肤：`source/css/miku.css`（配色、卡片、正文排版、浅色「雪初音」模式）

## 目录结构

```
├── index.html / archives/ / tags/ / about/   → 生成的页面（Pages 直接读取）
├── 2026/10/17/<slug>/index.html              → 文章页
├── css/ js/ img/ pluginsSrc/                 → 样式、脚本、素材、本地化的第三方库
├── 404.html  atom.xml  sitemap.xml  robots.txt
└── README.md
```

本站由 Hexo 构建，源码不在这个仓库里；这里只是构建产物。
修改内容请改源工程（`_config.yml`、`source/_posts/`、`source/css/miku.css`），然后重新构建推送。
