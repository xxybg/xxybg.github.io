// 轻量 Markdown 渲染器（零依赖）：标题、段落、列表、引用、代码块、表格、提示块
import { highlight } from './highlight.mjs'

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const escape = escapeHtml

const SLUG_KEEP = /[^\p{Script=Han}a-zA-Z0-9\u3040-\u30ff\uac00-\ud7af\s-]/gu

export function slugify(text) {
  return String(text)
    .replace(/<[^>]+>/g, '')
    .replace(/`/g, '')
    .replace(SLUG_KEEP, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/** 行内语法：`code` **bold** *italic* ~~del~~ [link](url) ![img](src) */
export function inline(text) {
  const codes = []
  let t = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c)
    return `\u0000C${codes.length - 1}\u0000`
  })
  t = escapeHtml(t)
  t = t.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, alt, src, title) =>
      `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy" decoding="async">`
  )
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, txt, href, title) =>
      `<a href="${href}"${title ? ` title="${title}"` : ''}${
        /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''
      }>${txt}</a>`
  )
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
  t = t.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  t = t.replace(/\u0000C(\d+)\u0000/g, (_, i) => `<code>${escapeHtml(codes[Number(i)])}</code>`)
  return t
}

const isFence = (l) => /^```/.test(l.trim())
const isHeading = (l) => /^#{1,6}\s+/.test(l)
const isHr = (l) => /^(\*{3,}|-{3,}|_{3,})\s*$/.test(l.trim())
const isQuote = (l) => /^>\s?/.test(l)
const isUl = (l) => /^[-*+]\s+/.test(l)
const isOl = (l) => /^\d+\.\s+/.test(l)
const isDivOpen = (l) => /^:::\s*(\w+)?\s*(.*)$/.test(l.trim())

function renderTable(rows) {
  const cells = (line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())
  const head = cells(rows[0])
  const aligns = cells(rows[1]).map((c) => {
    const l = c.startsWith(':')
    const r = c.endsWith(':')
    return l && r ? 'center' : r ? 'right' : l ? 'left' : ''
  })
  const body = rows.slice(2).map(cells)
  const th = head
    .map((c, i) => `<th${aligns[i] ? ` style="text-align:${aligns[i]}"` : ''}>${inline(c)}</th>`)
    .join('')
  const tb = body
    .map(
      (r) =>
        `<tr>${head
          .map((_, i) => `<td${aligns[i] ? ` style="text-align:${aligns[i]}"` : ''}>${inline(r[i] ?? '')}</td>`)
          .join('')}</tr>`
    )
    .join('')
  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`
}

const CALLOUT_ICON = { tip: '♪', note: 'i', warn: '!', info: 'i', miku: '39' }

/**
 * @returns {{html: string, toc: {level:number,text:string,id:string}[]}}
 */
export function renderMarkdown(md) {
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n')
  const toc = []
  const used = new Map()
  const out = []
  let i = 0

  const uniqueId = (text) => {
    const base = slugify(text) || 'section'
    const n = used.get(base) || 0
    used.set(base, n + 1)
    return n ? `${base}-${n}` : base
  }

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    // 代码块
    if (isFence(line)) {
      const lang = line.trim().slice(3).trim().split(/\s+/)[0] || 'text'
      i++
      const buf = []
      while (i < lines.length && !isFence(lines[i])) buf.push(lines[i++])
      if (i < lines.length) i++
      const code = buf.join('\n')
      out.push(
        `<figure class="code-block"><figcaption><span class="code-lang">${escapeHtml(
          lang
        )}</span><button class="code-copy" type="button" data-copy aria-label="复制代码">复制</button></figcaption><pre><code class="language-${escapeHtml(
          lang
        )}">${highlight(code, lang)}</code></pre></figure>`
      )
      continue
    }

    // 提示块 ::: tip 标题
    const divOpen = line.trim().match(/^:::\s*(\w+)?\s*(.*)$/)
    if (divOpen) {
      const kind = (divOpen[1] || 'note').toLowerCase()
      const title = divOpen[2] || ''
      i++
      const buf = []
      while (i < lines.length && !/^:::\s*$/.test(lines[i].trim())) buf.push(lines[i++])
      if (i < lines.length) i++
      const inner = renderMarkdown(buf.join('\n'))
      out.push(
        `<aside class="callout callout-${escapeHtml(kind)}"><span class="callout-icon">${
          CALLOUT_ICON[kind] || '♪'
        }</span><div class="callout-body">${
          title ? `<p class="callout-title">${inline(title)}</p>` : ''
        }${inner.html}</div></aside>`
      )
      continue
    }

    // 标题
    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/)
    if (h) {
      const level = h[1].length
      const text = h[2]
      const id = uniqueId(text)
      if (level === 2 || level === 3) toc.push({ level, text: text.replace(/`/g, ''), id })
      out.push(`<h${level} id="${id}">${inline(text)}<a class="anchor" href="#${id}" aria-hidden="true">#</a></h${level}>`)
      i++
      continue
    }

    // 分隔线
    if (isHr(line)) {
      out.push('<hr class="wave">')
      i++
      continue
    }

    // 表格
    if (line.includes('|') && /^\s*\|?[\s:-]*-[\s:|-]*$/.test(lines[i + 1] || '')) {
      const rows = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(lines[i++])
      if (rows.length >= 2) {
        out.push(renderTable(rows))
        continue
      }
      i -= rows.length
    }

    // 引用
    if (isQuote(line)) {
      const buf = []
      while (i < lines.length && (isQuote(lines[i]) || (lines[i].trim() && buf.length && !isHeading(lines[i])))) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      out.push(`<blockquote>${renderMarkdown(buf.join('\n')).html}</blockquote>`)
      continue
    }

    // 列表
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line)
      const marker = ordered ? /^\d+\.\s+/ : /^[-*+]\s+/
      const items = []
      while (i < lines.length) {
        const l = lines[i]
        if (marker.test(l)) {
          items.push(l.replace(marker, ''))
          i++
        } else if (l.trim() && /^\s{2,}/.test(l) && items.length) {
          items[items.length - 1] += ' ' + l.trim()
          i++
        } else if (!l.trim() && i + 1 < lines.length && marker.test(lines[i + 1])) {
          i++
        } else break
      }
      const tag = ordered ? 'ol' : 'ul'
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`)
      continue
    }

    // 段落
    const buf = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isFence(lines[i]) &&
      !isHeading(lines[i]) &&
      !isHr(lines[i]) &&
      !isQuote(lines[i]) &&
      !isUl(lines[i]) &&
      !isOl(lines[i]) &&
      !isDivOpen(lines[i])
    ) {
      buf.push(lines[i++])
    }
    if (buf.length) out.push(`<p>${inline(buf.join('\n'))}</p>`)
    else i++
  }

  return { html: out.join('\n'), toc }
}

/** 解析 YAML 风格 front matter */
export function parseFrontMatter(raw) {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: text }
  const data = {}
  for (const rawLine of m[1].split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if (!val) {
      data[key] = ''
      continue
    }
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else if (/^['"].*['"]$/.test(val)) {
      data[key] = val.slice(1, -1)
    } else {
      data[key] = val
    }
  }
  return { data, body: m[2] }
}
