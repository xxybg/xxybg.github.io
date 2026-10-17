// 构建脚本：node _source/build.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from './site.config.mjs'
import { renderMarkdown, parseFrontMatter, escape } from './lib/markdown.mjs'
import { page, hero, postCard, tagChip, waveform, icon } from './lib/layout.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = __dirname
const POSTS_DIR = path.join(SRC, 'posts')
const ASSETS_DIR = path.join(SRC, 'assets')

const written = new Set()

function write(rel, content) {
  const abs = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
  written.add(rel.replace(/\\/g, '/'))
}

function copyDir(from, toRel) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const abs = path.join(from, entry.name)
    const rel = path.posix.join(toRel, entry.name)
    if (entry.isDirectory()) copyDir(abs, rel)
    else {
      const target = path.join(ROOT, rel)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.copyFileSync(abs, target)
      written.add(rel)
    }
  }
}

// ---------- 读取文章 ----------
function parseDate(str) {
  const m = String(str).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (!m) return new Date()
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4] || 0),
    Number(m[5] || 0),
    Number(m[6] || 0)
  )
}

const pad = (n) => String(n).padStart(2, '0')

function loadPosts() {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.md$/i.test(f))
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
    const { data, body } = parseFrontMatter(raw)
    const date = parseDate(data.date || '2026-01-01')
    const slug = data.slug || file.replace(/\.md$/i, '')
    const { html, toc } = renderMarkdown(body)
    const title = data.title || slug
    const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []
    const plain = body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#>*_`~-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const summary = data.summary || data.excerpt || plain.slice(0, 96) + (plain.length > 96 ? '…' : '')
    const words = plain.replace(/\s/g, '').length
    return {
      file,
      slug,
      title,
      date,
      dateISO: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      dateText: `${date.getFullYear()} 年 ${pad(date.getMonth() + 1)} 月 ${pad(date.getDate())} 日`,
      shortDate: `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      tags,
      summary,
      html,
      toc,
      readingTime: Math.max(1, Math.round(words / 350)),
      url: `/${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${slug}/`,
      year: String(date.getFullYear()),
      month: pad(date.getMonth() + 1),
      draft: String(data.draft || '') === 'true'
    }
  })
  return posts.filter((p) => !p.draft).sort((a, b) => b.date - a.date)
}

const posts = loadPosts()

// ---------- 公共片段 ----------
const tagCount = new Map()
for (const p of posts) for (const t of p.tags) tagCount.set(t, (tagCount.get(t) || 0) + 1)
const allTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'))

const stats = [
  { value: String(posts.length).padStart(2, '0'), label: '篇文章' },
  { value: String(allTags.length).padStart(2, '0'), label: '个标签' },
  { value: '39', label: '主题色' }
]

function sectionHead(num, title, moreHref, moreText) {
  return `<header class="section-head">
    <h2 class="section-title"><span class="num">${num}</span>${escape(title)}</h2>
    ${moreHref ? `<a class="section-more" href="${moreHref}">${escape(moreText)}${icon('arrow')}</a>` : ''}
  </header>`
}

function pagerNav(current, total, base = '/') {
  if (total <= 1) return ''
  const href = (n) => (n === 1 ? '/' : `/page/${n}/`)
  return `<nav class="pager" aria-label="分页">
    ${current > 1 ? `<a class="pager-btn" href="${href(current - 1)}">← 上一页</a>` : '<span class="pager-btn is-disabled">← 上一页</span>'}
    <span class="pager-info">${current} / ${total}</span>
    ${
      current < total
        ? `<a class="pager-btn" href="${href(current + 1)}">下一页 →</a>`
        : '<span class="pager-btn is-disabled">下一页 →</span>'
    }
  </nav>`
}

function tagCloud(limit = 12) {
  return `<div class="tag-cloud">${allTags
    .slice(0, limit)
    .map(([t, c]) => tagChip(t, c))
    .join('')}</div>`
}

// ---------- 首页 ----------
function renderHome() {
  const per = config.postsPerPage
  const total = Math.max(1, Math.ceil(posts.length / per))
  const build = (nums) => {
    const list = nums.map((p, i) => postCard(p, i)).join('')
    return `<main class="home">
${hero(config, stats)}
<section class="section" id="posts">
  <div class="wrap">
    ${sectionHead('01', '最新文章', '/archives/', '全部归档')}
    <div class="post-grid">${list || '<p class="empty">还没有文章，去 <code>_source/posts/</code> 里写一篇吧。</p>'}</div>
    ${pagerNav(1, total)}
  </div>
</section>
<section class="section section-alt" id="tags">
  <div class="wrap">
    ${sectionHead('02', '标签云', '/tags/', '全部标签')}
    ${tagCloud()}
  </div>
</section>
<section class="section" id="about-card">
  <div class="wrap">
    <div class="about-banner reveal">
      <img src="/assets/img/miku-mark.svg" alt="" class="about-banner-mark" aria-hidden="true">
      <div>
        <h2>关于这个小站</h2>
        <p>${escape(config.description)}</p>
      </div>
      <a class="btn btn-primary" href="/about/">认识一下${icon('arrow')}</a>
    </div>
  </div>
</section>
</main>`
  }

  write('index.html', page({ site: config, permalink: '/', bodyClass: 'page-home', content: build(posts.slice(0, per)) }))

  for (let n = 2; n <= total; n++) {
    const slice = posts.slice((n - 1) * per, n * per)
    const content = `<main class="home">
<section class="section section-first">
  <div class="wrap">
    ${sectionHead('00', `第 ${n} 页`, '/', '回到首页')}
    <div class="post-grid">${slice.map((p, i) => postCard(p, i)).join('')}</div>
    ${pagerNav(n, total)}
  </div>
</section>
</main>`
    write(
      `page/${n}/index.html`,
      page({ site: config, permalink: `/page/${n}/`, title: `第 ${n} 页`, bodyClass: 'page-home', content })
    )
  }
}

// ---------- 文章页 ----------
function renderPost(post, older, newer) {
  const tocHtml = post.toc.length
    ? `<nav class="toc reveal" aria-label="文章目录">
    <p class="toc-title">${icon('music')}目录</p>
    <ol>${post.toc
      .map((t) => `<li class="toc-l${t.level}"><a href="#${t.id}">${escape(t.text)}</a></li>`)
      .join('')}</ol>
  </nav>`
    : ''

  const content = `<main class="post-page">
  <article>
    <header class="post-header">
      <div class="wrap post-header-inner">
        <nav class="crumb" aria-label="面包屑">
          <a href="/">首页</a><span>/</span><a href="/archives/">归档</a><span>/</span><em>${escape(post.shortDate)}</em>
        </nav>
        <h1 class="post-title reveal">${escape(post.title)}</h1>
        <div class="post-meta reveal">
          <span>${icon('clock')}${post.dateText}</span>
          <span>${icon('music')}约 ${post.readingTime} 分钟</span>
          <span class="post-tags">${post.tags
            .map((t) => `<a href="/tags/${encodeURIComponent(t)}/">#${escape(t)}</a>`)
            .join('')}</span>
        </div>
        ${waveform('post-wave')}
      </div>
    </header>
    <div class="wrap post-layout">
      <div class="post-body reveal">${post.html}</div>
      ${tocHtml ? `<aside class="post-aside">${tocHtml}</aside>` : ''}
    </div>
  </article>
  <nav class="wrap post-nav" aria-label="上下篇">
    ${
      older
        ? `<a class="post-nav-item prev" href="${older.url}"><small>上一篇</small><strong>${escape(older.title)}</strong></a>`
        : '<span class="post-nav-item is-empty"></span>'
    }
    ${
      newer
        ? `<a class="post-nav-item next" href="${newer.url}"><small>下一篇</small><strong>${escape(newer.title)}</strong></a>`
        : '<span class="post-nav-item is-empty"></span>'
    }
  </nav>
</main>`
  write(
    `${post.url.slice(1)}index.html`,
    page({
      site: config,
      permalink: post.url,
      title: post.title,
      description: post.summary,
      type: 'article',
      bodyClass: 'page-post',
      content
    })
  )
}

// ---------- 归档 ----------
function renderArchives() {
  const byYear = new Map()
  for (const p of posts) {
    if (!byYear.has(p.year)) byYear.set(p.year, new Map())
    const months = byYear.get(p.year)
    if (!months.has(p.month)) months.set(p.month, [])
    months.get(p.month).push(p)
  }
  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a))
  const body = years
    .map(
      (y) => `<section class="tl-year reveal">
      <header class="tl-year-head">
        <h2>${y}</h2>
        <a class="tl-count" href="/archives/${y}/">${[...byYear.get(y).values()].flat().length} 篇</a>
      </header>
      ${[...byYear.get(y).keys()]
        .sort((a, b) => Number(b) - Number(a))
        .map(
          (m) => `<div class="tl-month">
          <h3><a href="/archives/${y}/${m}/">${Number(m)} 月</a></h3>
          <ul>${byYear
            .get(y)
            .get(m)
            .map(
              (p) => `<li><a href="${p.url}"><time>${p.shortDate}</time><span>${escape(p.title)}</span></a></li>`
            )
            .join('')}</ul>
        </div>`
        )
        .join('')}
    </section>`
    )
    .join('')

  const content = `<main class="page-simple">
  <header class="page-head">
    <div class="wrap">
      <p class="page-kicker">ARCHIVES</p>
      <h1>归档</h1>
      <p class="page-sub">共 ${posts.length} 篇文章，按时间倒序排列。</p>
    </div>
  </header>
  <div class="wrap"><div class="timeline">${body || '<p class="empty">暂无文章。</p>'}</div></div>
</main>`
  write('archives/index.html', page({ site: config, permalink: '/archives/', title: '归档', description: `全部 ${posts.length} 篇文章的归档`, content }))

  // 年 / 月归档页
  for (const y of years) {
    const list = [...byYear.get(y).values()].flat().sort((a, b) => b.date - a.date)
    write(
      `archives/${y}/index.html`,
      page({
        site: config,
        permalink: `/archives/${y}/`,
        title: `${y} 年`,
        description: `${y} 年的文章归档`,
        bodyClass: 'page-simple',
        content: `<main class="page-simple">
  <header class="page-head"><div class="wrap"><p class="page-kicker">ARCHIVES · ${y}</p><h1>${y} 年的文章</h1><p class="page-sub">${list.length} 篇</p></div></header>
  <div class="wrap"><ul class="plain-list">${list
    .map((p) => `<li><a href="${p.url}"><time>${p.shortDate}</time><span>${escape(p.title)}</span></a></li>`)
    .join('')}</ul></div>
</main>`
      })
    )
    for (const m of [...byYear.get(y).keys()]) {
      const mList = byYear.get(y).get(m)
      write(
        `archives/${y}/${m}/index.html`,
        page({
          site: config,
          permalink: `/archives/${y}/${m}/`,
          title: `${y} 年 ${Number(m)} 月`,
          bodyClass: 'page-simple',
          content: `<main class="page-simple">
  <header class="page-head"><div class="wrap"><p class="page-kicker">ARCHIVES · ${y}/${m}</p><h1>${y} 年 ${Number(m)} 月</h1><p class="page-sub">${mList.length} 篇</p></div></header>
  <div class="wrap"><ul class="plain-list">${mList
    .map((p) => `<li><a href="${p.url}"><time>${p.shortDate}</time><span>${escape(p.title)}</span></a></li>`)
    .join('')}</ul></div>
</main>`
        })
      )
    }
  }
}

// ---------- 标签 ----------
function renderTags() {
  const content = `<main class="page-simple">
  <header class="page-head">
    <div class="wrap">
      <p class="page-kicker">TAGS</p>
      <h1>标签</h1>
      <p class="page-sub">${allTags.length} 个标签，像歌单一样分类。</p>
    </div>
  </header>
  <div class="wrap"><div class="tag-cloud big">${allTags.map(([t, c]) => tagChip(t, c)).join('')}</div></div>
</main>`
  write('tags/index.html', page({ site: config, permalink: '/tags/', title: '标签', description: '全部标签', content }))

  for (const [t, c] of allTags) {
    const list = posts.filter((p) => p.tags.includes(t))
    write(
      `tags/${t}/index.html`,
      page({
        site: config,
        permalink: `/tags/${t}/`,
        title: `#${t}`,
        description: `标签 ${t} 下的文章`,
        bodyClass: 'page-simple',
        content: `<main class="page-simple">
  <header class="page-head"><div class="wrap"><p class="page-kicker">TAG · ${escape(t)}</p><h1>#${escape(t)}</h1><p class="page-sub">${c} 篇文章</p></div></header>
  <div class="wrap"><div class="post-grid">${list.map((p, i) => postCard(p, i)).join('')}</div>
  <p class="back-link"><a href="/tags/">← 全部标签</a></p></div>
</main>`
      })
    )
  }
}

// ---------- 关于 ----------
function renderAbout() {
  const a = config.about
  const content = `<main class="page-simple about-page">
  <header class="page-head">
    <div class="wrap">
      <p class="page-kicker">ABOUT</p>
      <h1>关于</h1>
      <p class="page-sub">${escape(a.role)}</p>
    </div>
  </header>
  <div class="wrap about-grid">
    <div class="about-card reveal">
      <img src="/assets/img/miku-avatar.svg" alt="${escape(a.name)} 的头像" class="about-avatar" width="132" height="132">
      <h2>${escape(a.name)}</h2>
      <p class="about-role">${escape(a.role)}</p>
      <div class="about-facts">${a.facts
        .map((f) => `<div><span>${escape(f.k)}</span><strong>${escape(f.v)}</strong></div>`)
        .join('')}</div>
    </div>
    <div class="about-text reveal">
      ${a.intro.map((p) => `<p>${escape(p)}</p>`).join('')}
      <div class="palette">
        <span style="--c:#39C5BB"><i></i>Miku Teal</span>
        <span style="--c:#7FDED8"><i></i>Hair Light</span>
        <span style="--c:#FF7FAE"><i></i>Sakura</span>
        <span style="--c:#0B1119"><i></i>Night</span>
      </div>
      <div class="player-card">
        <div class="player-wave" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--h:${8 + ((i * 37) % 26)}px"></i>`).join('')}</div>
        <div class="player-info"><small>本命曲 · NOW PLAYING</small><strong>World is Mine</strong></div>
        <span class="player-badge">♪</span>
      </div>
      <p class="muted">想聊聊？在 <a href="${config.social[0].url}" target="_blank" rel="noopener">GitHub</a> 上找我。</p>
    </div>
  </div>
</main>`
  write('about/index.html', page({ site: config, permalink: '/about/', title: '关于', description: `关于 ${a.name}`, content }))
}

// ---------- 404 / 订阅 ----------
function render404() {
  const content = `<main class="page-simple error-page">
  <div class="wrap error-inner">
    <p class="error-code">404</p>
    <h1>这首曲子不存在</h1>
    <p class="page-sub">你要找的页面走调了，或者从来没有被写出来。</p>
    <div class="hero-actions center">
      <a class="btn btn-primary" href="/">回到首页${icon('arrow')}</a>
      <a class="btn btn-ghost" href="/archives/">看看归档</a>
    </div>
    <img src="/assets/img/miku-mark.svg" alt="" class="error-mark" aria-hidden="true">
  </div>
</main>`
  write('404.html', page({ site: config, permalink: '/404.html', title: '404', bodyClass: 'page-404', content }))
}

const xmlEscape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function renderFeeds() {
  const updated = posts[0]?.date || new Date()
  const entries = posts
    .slice(0, 20)
    .map(
      (p) => `<entry>
    <title>${xmlEscape(p.title)}</title>
    <link href="${config.url}${encodeURI(p.url)}"/>
    <id>${config.url}${encodeURI(p.url)}</id>
    <updated>${p.date.toISOString()}</updated>
    <summary>${xmlEscape(p.summary)}</summary>
    ${p.tags.map((t) => `<category term="${xmlEscape(t)}"/>`).join('\n    ')}
  </entry>`
    )
    .join('\n  ')
  write(
    'atom.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xmlEscape(config.title)}</title>
  <subtitle>${xmlEscape(config.description)}</subtitle>
  <link href="${config.url}/atom.xml" rel="self"/>
  <link href="${config.url}/"/>
  <id>${config.url}/</id>
  <updated>${updated.toISOString()}</updated>
  <author><name>${xmlEscape(config.author)}</name></author>
  ${entries}
</feed>
`
  )

  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', '/archives/', '/tags/', '/about/']
  .map((u) => `  <url><loc>${config.url}${u}</loc></url>`)
  .join('\n')}
${posts.map((p) => `  <url><loc>${config.url}${encodeURI(p.url)}</loc><lastmod>${p.dateISO}</lastmod></url>`).join('\n')}
</urlset>
`
  )

  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${config.url}/sitemap.xml\n`)

  write(
    'assets/data/posts.json',
    JSON.stringify(
      posts.map((p) => ({ title: p.title, url: p.url, date: p.dateISO, tags: p.tags, summary: p.summary })),
      null,
      2
    )
  )
}

// ---------- 执行 ----------
fs.rmSync(path.join(ROOT, '2026'), { recursive: true, force: true })
renderHome()
posts.forEach((p, i) => renderPost(p, posts[i + 1], posts[i - 1]))
renderArchives()
renderTags()
renderAbout()
render404()
renderFeeds()
copyDir(ASSETS_DIR, 'assets')
write('.nojekyll', '')

console.log(`✓ 构建完成：${posts.length} 篇文章 / ${allTags.length} 个标签 / ${written.size} 个文件`)
