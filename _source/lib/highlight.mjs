// 极小的语法高亮：够用就好，绝不引入依赖
const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const jsKw =
  'const let var function return if else for while do switch case break continue class extends new this super import export from default async await try catch finally throw typeof instanceof void delete in of yield static get set null true false undefined NaN Infinity'

const CFG = {
  js: { kw: jsKw, line: '//', block: true },
  javascript: { kw: jsKw, line: '//', block: true },
  jsx: { kw: jsKw, line: '//', block: true },
  mjs: { kw: jsKw, line: '//', block: true },
  ts: {
    kw: jsKw + ' interface type enum implements private public protected readonly declare namespace as satisfies unknown any never string number boolean',
    line: '//',
    block: true
  },
  typescript: {
    kw: jsKw + ' interface type enum implements private public protected readonly declare namespace as satisfies unknown any never string number boolean',
    line: '//',
    block: true
  },
  json: { kw: 'true false null', line: null, block: false },
  bash: { kw: 'if then elif else fi for in do done while case esac function echo cd export local return exit sudo npm npx node git curl', line: '#', block: false },
  sh: { kw: 'if then elif else fi for in do done while case esac function echo cd export local return exit sudo npm npx node git curl', line: '#', block: false },
  shell: { kw: 'if then elif else fi for in do done while case esac function echo cd export local return exit sudo npm npx node git curl', line: '#', block: false },
  powershell: { kw: 'if else elseif foreach for while function param return try catch finally throw $true $false', line: '#', block: true },
  python: { kw: 'def class return if elif else for while import from as with try except finally raise lambda None True False and or not in is pass break continue yield global nonlocal async await', line: '#', block: false },
  css: { kw: null, line: null, block: true },
  yaml: { kw: 'true false null', line: '#', block: false },
  yml: { kw: 'true false null', line: '#', block: false }
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const cache = new Map()

function buildRegex(lang) {
  if (cache.has(lang)) return cache.get(lang)
  const cfg = CFG[lang] || {}
  const parts = [
    '(?<str>"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)',
    cfg.block ? '(?<bcom>/\\*[\\s\\S]*?\\*/)' : '',
    cfg.line ? `(?<com>${escRe(cfg.line)}[^\\n]*)` : '',
    '(?<num>\\b0[xX][0-9a-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?\\b)',
    '(?<fn>[A-Za-z_$][\\w$]*(?=\\s*\\())',
    cfg.kw ? `(?<kw>\\b(?:${cfg.kw.split(' ').join('|')})\\b)` : '',
    '(?<punc>[{}()\\[\\];:,.<>=+\\-*/%!&|?^~]+)'
  ].filter(Boolean)
  const re = new RegExp(parts.join('|'), 'g')
  cache.set(lang, re)
  return re
}

export function highlight(code, lang = 'text') {
  const key = String(lang).toLowerCase()
  const re = buildRegex(key)
  re.lastIndex = 0
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(code))) {
    if (m.index > last) out += escapeHtml(code.slice(last, m.index))
    const g = m.groups || {}
    const text = escapeHtml(m[0])
    if (g.str) out += `<span class="tok-str">${text}</span>`
    else if (g.bcom) out += `<span class="tok-com">${text}</span>`
    else if (g.com) out += `<span class="tok-com">${text}</span>`
    else if (g.num) out += `<span class="tok-num">${text}</span>`
    else if (g.fn) out += `<span class="tok-fn">${text}</span>`
    else if (g.kw) out += `<span class="tok-kw">${text}</span>`
    else if (g.punc) out += `<span class="tok-punc">${text}</span>`
    else out += text
    last = m.index + m[0].length
    if (m[0].length === 0) re.lastIndex++
  }
  out += escapeHtml(code.slice(last))
  return out
}
