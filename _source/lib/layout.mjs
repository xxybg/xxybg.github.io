// 页面骨架：head / header / footer / hero
import { escape } from './markdown.mjs'

const ICONS = {
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><g stroke-linecap="round"><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9"/></g></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 14.6A8.6 8.6 0 1 1 9.4 3.6a7 7 0 0 0 11 11Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.11-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.21 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2.2Z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.4v5l3.2 1.9" stroke-linecap="round"/></svg>',
  tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.2 3.6H5a1.4 1.4 0 0 0-1.4 1.4v6.2c0 .37.15.73.41 1l8.3 8.3a1.4 1.4 0 0 0 2 0l6.2-6.2a1.4 1.4 0 0 0 0-2l-8.3-8.3a1.4 1.4 0 0 0-1-.4Z"/><circle cx="8.1" cy="8.1" r="1.5"/></svg>',
  music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 18.2V6.1l9.4-2v11.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.9" cy="18.4" r="2.5"/><circle cx="16.3" cy="16.7" r="2.5"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.6"/><path d="M16 16l4.2 4.2" stroke-linecap="round"/></svg>'
}

export const icon = (name) => ICONS[name] || ''

/** 平滑声波：交替的半圆波，缩放后依然圆润 */
function wavePath(width = 1200, height = 60, segments = 24) {
  const step = width / segments
  const mid = height / 2
  const amp = height * 0.33
  let d = `M0 ${mid.toFixed(1)}`
  for (let i = 0; i < segments; i++) {
    const x1 = (i + 1) * step
    const peak = mid + (i % 2 === 0 ? -1 : 1) * amp * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7)))
    d += ` Q${(i * step + step / 2).toFixed(1)} ${peak.toFixed(1)} ${x1.toFixed(1)} ${mid.toFixed(1)}`
  }
  return d
}

export function waveform(cls = 'waveform', flip = false) {
  const id = `wg${flip ? 2 : 1}${cls.replace(/[^a-z]/gi, '')}`
  return `<svg class="${cls}" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#39C5BB" stop-opacity="0"/><stop offset=".35" stop-color="#39C5BB"/><stop offset=".7" stop-color="#FF7FAE"/><stop offset="1" stop-color="#FF7FAE" stop-opacity="0"/></linearGradient></defs><path d="${wavePath()}" fill="none" stroke="url(#${id})" stroke-width="2" stroke-linecap="round"/></svg>`
}

function head({ site, pageTitle, description, permalink, type = 'website', extraHead = '' }) {
  const fullTitle = pageTitle ? `${pageTitle} · ${site.title}` : `${site.title} · ${site.subtitle}`
  return `<!DOCTYPE html>
<html lang="${site.lang}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(fullTitle)}</title>
<meta name="description" content="${escape(description)}">
<meta name="author" content="${escape(site.author)}">
<meta name="keywords" content="${escape(site.keywords.join(','))}">
<meta name="theme-color" content="#0b1119">
<link rel="canonical" href="${escape(site.url + permalink)}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${escape(site.title)}">
<meta property="og:title" content="${escape(fullTitle)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${escape(site.url + permalink)}">
<meta property="og:image" content="${escape(site.url + '/assets/img/og.svg')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/favicon.svg">
<link rel="alternate" type="application/atom+xml" title="${escape(site.title)}" href="/atom.xml">
<link rel="stylesheet" href="/assets/css/miku.css">
<script>(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('miku-theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();</script>
${extraHead}
</head>`
}

function header(site, active = '/') {
  const links = site.nav
    .map((item) => {
      const isActive = item.url === active || (item.url !== '/' && active.startsWith(item.url))
      return `<a href="${item.url}" class="nav-link${isActive ? ' is-active' : ''}"${
        isActive ? ' aria-current="page"' : ''
      }>${escape(item.title)}</a>`
    })
    .join('')
  return `<header class="site-header" id="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${escape(site.title)} 首页">
      <span class="brand-mark" aria-hidden="true"><span>39</span></span>
      <span class="brand-text"><strong>${escape(site.title)}</strong><small>${escape(site.subtitle)}</small></span>
    </a>
    <nav class="nav" id="nav" aria-label="主导航">${links}</nav>
    <div class="header-actions">
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="切换昼/夜模式" title="切换昼 / 夜">
        <span class="i-moon">${ICONS.moon}</span><span class="i-sun">${ICONS.sun}</span>
      </button>
      <button class="icon-btn nav-toggle" id="nav-toggle" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="nav">
        <span class="i-menu">${ICONS.menu}</span><span class="i-close">${ICONS.close}</span>
      </button>
    </div>
  </div>
</header>`
}

function footer(site) {
  const year = new Date().getFullYear()
  const links = site.nav
    .map((item) => `<a href="${item.url}">${escape(item.title)}</a>`)
    .concat(site.social.map((s) => `<a href="${s.url}" rel="noopener" target="_blank">${escape(s.title)}</a>`))
    .join('')
  return `<footer class="site-footer">
  ${waveform('footer-wave')}
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <span class="brand-mark small" aria-hidden="true"><span>39</span></span>
      <p><strong>${escape(site.title)}</strong><br><span class="muted">© ${year} ${escape(
    site.author
  )} · Built with ♪ and zero dependencies</span></p>
    </div>
    <nav class="footer-links" aria-label="页脚导航">${links}</nav>
  </div>
  <p class="footer-note wrap">${escape(site.footer.note)}</p>
</footer>
<button class="to-top" id="to-top" type="button" aria-label="回到顶部">${ICONS.up}</button>`
}

export function page({ site, title, description = site.description, permalink = '/', type, bodyClass = '', content }) {
  return `${head({ site, pageTitle: title, description, permalink, type })}
<body class="${bodyClass}" data-page="${escape(permalink)}">
<div class="bg-fx" aria-hidden="true"><span class="petal p1"></span><span class="petal p2"></span><span class="petal p3"></span><span class="petal p4"></span><span class="petal p5"></span><span class="grid-fx"></span><span class="glow g1"></span><span class="glow g2"></span></div>
<div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>
${header(site, permalink)}
${content}
${footer(site)}
<script src="/assets/js/miku.js" defer></script>
</body>
</html>`
}

export function hero(site, stats) {
  const h = site.hero
  const titleHtml = h.title.replace(
    h.highlight,
    `<span class="grad">${escape(h.highlight)}</span>`
  )
  return `<section class="hero" id="top">
  <canvas class="hero-canvas" id="wave-canvas" aria-hidden="true"></canvas>
  <div class="wrap hero-inner">
    <div class="hero-copy reveal">
      <p class="hero-kicker"><span class="pulse-dot"></span>${escape(h.kicker)}</p>
      <h1 class="hero-title">${titleHtml}</h1>
      <p class="hero-typing"><span class="typed" data-typing='${escape(JSON.stringify(h.typing))}'></span><span class="caret" aria-hidden="true"></span></p>
      <p class="hero-desc">${escape(h.desc)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${h.primary.url}">${escape(h.primary.title)}${ICONS.arrow}</a>
        <a class="btn btn-ghost" href="${h.secondary.url}">${escape(h.secondary.title)}</a>
      </div>
      <ul class="hero-stats">
        ${stats
          .map((s) => `<li><strong>${escape(s.value)}</strong><span>${escape(s.label)}</span></li>`)
          .join('')}
      </ul>
    </div>
    <div class="hero-art reveal" aria-hidden="true">
      <span class="hero-ring r1"></span><span class="hero-ring r2"></span><span class="hero-ring r3"></span>
      <img class="hero-img" src="/assets/img/miku-hero.svg" alt="初音未来风格的青绿色角色插画" width="520" height="620">
      <span class="float-note n1">♪</span>
      <span class="float-note n2">♬</span>
      <span class="float-note n3">39</span>
      <span class="float-note n4">♩</span>
      <span class="hud">HATSUNE MIKU · 01</span>
    </div>
  </div>
  ${waveform('hero-wave')}
</section>`
}

export function tagChip(tag, count) {
  return `<a class="tag-chip" href="/tags/${encodeURIComponent(tag)}/">${ICONS.tag}<span>${escape(tag)}</span>${
    count ? `<i>${count}</i>` : ''
  }</a>`
}

export function postCard(post, index) {
  return `<article class="post-card reveal" style="--i:${index}">
  <a class="post-card-link" href="${post.url}">
    <div class="post-card-glow" aria-hidden="true"></div>
    <div class="post-card-head">
      <time datetime="${post.dateISO}">${post.dateText}</time>
      <span class="post-card-num">${String(index + 1).padStart(2, '0')}</span>
    </div>
    <h3 class="post-card-title">${escape(post.title)}</h3>
    <p class="post-card-excerpt">${escape(post.summary)}</p>
    <div class="post-card-foot">
      <div class="post-card-tags">${post.tags.map((t) => `<span>#${escape(t)}</span>`).join('')}</div>
      <span class="read-more">阅读${ICONS.arrow}</span>
    </div>
  </a>
</article>`
}
