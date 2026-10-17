// 生成 miku-hero.svg：用 Catmull-Rom 平滑曲线画初音立绘
// 用法：node _source/tools/gen-art.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/img/miku-hero.svg')
const CX = 260

const r = (n) => Math.round(n * 10) / 10

/** Catmull-Rom 转三次贝塞尔，闭合或开放 */
function smooth(points, close = true, tension = 1) {
  const n = points.length
  const at = (i) => points[((i % n) + n) % n]
  let d = `M${r(points[0][0])} ${r(points[0][1])}`
  const last = close ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = close ? at(i - 1) : points[Math.max(0, i - 1)]
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = close ? at(i + 2) : points[Math.min(n - 1, i + 2)]
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension]
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension]
    d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`
  }
  return d + (close ? 'Z' : '')
}

const mirror = (pts) => pts.map(([x, y]) => [CX * 2 - x, y])
const strand = (tl, ml, tip, mr, tr) => smooth([tl, ml, tip, mr, tr], true, 1)

// ---------- 双马尾 ----------
const tail = [
  [206, 186],
  [168, 214],
  [130, 268],
  [110, 330],
  [102, 396],
  [104, 466],
  [116, 536],
  [136, 600],
  [152, 640],
  [156, 596],
  [152, 540],
  [146, 480],
  [146, 418],
  [152, 356],
  [166, 300],
  [186, 250],
  [208, 212],
  [218, 190]
]

const tailShine = [
  [188, 214],
  [152, 272],
  [132, 336],
  [126, 400],
  [128, 460],
  [138, 520],
  [152, 574],
  [146, 520],
  [140, 458],
  [140, 396],
  [148, 336],
  [166, 276],
  [196, 220]
]

// ---------- 脸 ----------
const face = [
  [260, 116],
  [214, 138],
  [190, 186],
  [184, 240],
  [190, 286],
  [212, 320],
  [240, 336],
  [260, 340],
  [280, 336],
  [308, 320],
  [330, 286],
  [336, 240],
  [330, 186],
  [306, 138]
]

// ---------- 头发前层：一整块，含锯齿状刘海，不会露出接缝 ----------
const hairFront = [
  'M184 250',
  'C181 196 195 148 224 126',
  'C248 110 280 110 302 128',
  'C330 150 339 198 336 250',
  'L331 216',
  'L323 254',
  'Q317 232 310 208',
  'L303 246',
  'Q297 224 290 202',
  'L281 256',
  'Q273 226 265 200',
  'L255 250',
  'Q249 228 243 206',
  'L233 244',
  'Q227 226 221 208',
  'L211 240',
  'Q203 224 197 212',
  'Z'
].join(' ')

// ---------- 侧发 ----------
const sideLock = [
  [190, 196],
  [180, 250],
  [178, 310],
  [184, 368],
  [192, 408],
  [198, 364],
  [198, 308],
  [200, 254],
  [208, 206]
]

// ---------- 身体 ----------
const body = [
  [238, 352],
  [204, 366],
  [176, 392],
  [162, 432],
  [156, 492],
  [154, 566],
  [154, 640],
  [366, 640],
  [366, 566],
  [364, 492],
  [358, 432],
  [344, 392],
  [316, 366],
  [282, 352]
]

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 640" width="520" height="640" role="img" aria-label="初音未来风格的青绿色角色插画">
  <defs>
    <linearGradient id="hair" x1="0.1" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#8DF2E8" />
      <stop offset="0.38" stop-color="#45D0C5" />
      <stop offset="1" stop-color="#127B76" />
    </linearGradient>
    <linearGradient id="hairBack" x1="0" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#3FBDB3" />
      <stop offset="1" stop-color="#0E5E5A" />
    </linearGradient>
    <linearGradient id="skin" x1="0.2" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FFF3EE" />
      <stop offset="1" stop-color="#F8D2CA" />
    </linearGradient>
    <linearGradient id="iris" x1="0.2" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#07544F" />
      <stop offset="0.5" stop-color="#2AB6AB" />
      <stop offset="1" stop-color="#9DF6EC" />
    </linearGradient>
    <linearGradient id="cloth" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#22343F" />
      <stop offset="1" stop-color="#0A141C" />
    </linearGradient>
    <linearGradient id="shirt" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#EAF3F4" />
      <stop offset="1" stop-color="#BCCACF" />
    </linearGradient>
    <linearGradient id="tie" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#7BEDE1" />
      <stop offset="1" stop-color="#1E9B92" />
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.4" r="0.55">
      <stop offset="0" stop-color="#39C5BB" stop-opacity="0.4" />
      <stop offset="0.6" stop-color="#39C5BB" stop-opacity="0.1" />
      <stop offset="1" stop-color="#39C5BB" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.86" stop-color="#fff" stop-opacity="1" />
      <stop offset="1" stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <mask id="bottomFade"><rect width="520" height="640" fill="url(#fade)" /></mask>
  </defs>

  <circle cx="260" cy="300" r="250" fill="url(#halo)" />
  <g fill="none" stroke="#39C5BB" stroke-opacity="0.3">
    <circle cx="260" cy="300" r="205" stroke-dasharray="2 11" />
    <circle cx="260" cy="300" r="168" stroke-dasharray="40 14" stroke-opacity="0.16" />
  </g>

  <g mask="url(#bottomFade)">
    <path d="${smooth(tail)}" fill="url(#hairBack)" />
    <path d="${smooth(mirror(tail))}" fill="url(#hairBack)" />
    <path d="${smooth(tailShine)}" fill="#8DF2E8" fill-opacity="0.16" />
    <path d="${smooth(mirror(tailShine))}" fill="#8DF2E8" fill-opacity="0.16" />

    <path d="${smooth(body)}" fill="url(#cloth)" />
    <path d="M206 372 C190 430 180 520 178 640" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="2.4" />
    <path d="M314 372 C330 430 340 520 342 640" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="2.4" />
    <path d="M164 404 C156 470 152 550 152 636" fill="none" stroke="#39C5BB" stroke-opacity="0.32" stroke-width="2" />
    <path d="M356 404 C364 470 368 550 368 636" fill="none" stroke="#39C5BB" stroke-opacity="0.32" stroke-width="2" />
    <path d="M231 354 L260 398 L289 354 L281 344 L239 344 Z" fill="url(#shirt)" />
    <path d="M260 388 L277 412 L260 486 L243 412 Z" fill="url(#tie)" />
    <path d="M243 412 L260 430 L277 412" fill="none" stroke="#0E6B65" stroke-opacity="0.45" stroke-width="2" />

    <path d="M236 306 h48 v54 c0 16-12 24-24 24 s-24-8-24-24 Z" fill="#F5D6CE" />

    <path d="${smooth(face)}" fill="url(#skin)" stroke="#E9B9B0" stroke-opacity="0.45" stroke-width="1.6" />

    <!-- 眼睛 -->
    <g>
      <path d="M210 264 q18-20 36 0 q-18 22-36 0 Z" fill="#FFFFFF" />
      <circle cx="228" cy="264" r="11" fill="url(#iris)" />
      <ellipse cx="228" cy="265" rx="4.8" ry="6.4" fill="#06302E" />
      <circle cx="224" cy="259" r="3.4" fill="#FFFFFF" />
      <circle cx="232" cy="270" r="1.9" fill="#FFFFFF" fill-opacity="0.8" />
      <path d="M208 259 q20-19 40 0" fill="none" stroke="#093B38" stroke-width="4.2" stroke-linecap="round" />
      <path d="M212 276 q16 10 32 0" fill="none" stroke="#093B38" stroke-opacity="0.35" stroke-width="1.6" stroke-linecap="round" />
    </g>
    <g>
      <path d="M274 264 q18-20 36 0 q-18 22-36 0 Z" fill="#FFFFFF" />
      <circle cx="292" cy="264" r="11" fill="url(#iris)" />
      <ellipse cx="292" cy="265" rx="4.8" ry="6.4" fill="#06302E" />
      <circle cx="288" cy="259" r="3.4" fill="#FFFFFF" />
      <circle cx="296" cy="270" r="1.9" fill="#FFFFFF" fill-opacity="0.8" />
      <path d="M272 259 q20-19 40 0" fill="none" stroke="#093B38" stroke-width="4.2" stroke-linecap="round" />
      <path d="M276 276 q16 10 32 0" fill="none" stroke="#093B38" stroke-opacity="0.35" stroke-width="1.6" stroke-linecap="round" />
    </g>

    <path d="M212 240 q18-10 32-3" fill="none" stroke="#1C6E6A" stroke-opacity="0.4" stroke-width="2.6" stroke-linecap="round" />
    <path d="M276 237 q14-7 32 3" fill="none" stroke="#1C6E6A" stroke-opacity="0.4" stroke-width="2.6" stroke-linecap="round" />
    <ellipse cx="212" cy="292" rx="16" ry="7" fill="#FF9EC4" fill-opacity="0.4" />
    <ellipse cx="308" cy="292" rx="16" ry="7" fill="#FF9EC4" fill-opacity="0.4" />
    <path d="M250 314 q10 8 20 0" fill="none" stroke="#B3706B" stroke-width="2.2" stroke-linecap="round" />

    <path d="${hairFront}" fill="url(#hair)" />
    <path d="M198 190 C210 152 232 130 258 124" fill="none" stroke="#DFFFFA" stroke-opacity="0.3" stroke-width="9" stroke-linecap="round" />

    <path d="${smooth(sideLock)}" fill="url(#hair)" />
    <path d="${smooth(mirror(sideLock))}" fill="url(#hair)" />

    <g>
      <rect x="164" y="228" width="26" height="58" rx="12" fill="#13242E" stroke="#39C5BB" stroke-width="2" />
      <circle cx="177" cy="257" r="6.5" fill="#39C5BB" />
      <circle cx="177" cy="257" r="13" fill="#39C5BB" fill-opacity="0.2" />
      <rect x="330" y="228" width="26" height="58" rx="12" fill="#13242E" stroke="#39C5BB" stroke-width="2" />
      <circle cx="343" cy="257" r="6.5" fill="#39C5BB" />
      <circle cx="343" cy="257" r="13" fill="#39C5BB" fill-opacity="0.2" />
      <path d="M330 266 c-14 6-22 14-26 24" fill="none" stroke="#39C5BB" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.9" />
      <circle cx="303" cy="291" r="3.6" fill="#39C5BB" />
    </g>
  </g>

  <g font-family="ui-monospace, Consolas, monospace" font-weight="700">
    <text x="66" y="168" font-size="26" fill="#39C5BB" fill-opacity="0.7">♪</text>
    <text x="424" y="212" font-size="20" fill="#FF7FAE" fill-opacity="0.75">♬</text>
    <text x="398" y="470" font-size="16" fill="#5FE3D8" fill-opacity="0.65">♩</text>
  </g>
  <g fill="#39C5BB">
    <circle cx="112" cy="252" r="3" fill-opacity="0.65" />
    <circle cx="396" cy="146" r="2.4" fill-opacity="0.5" />
    <circle cx="446" cy="352" r="2.6" fill-opacity="0.45" />
    <circle cx="78" cy="380" r="2.2" fill-opacity="0.4" />
  </g>
</svg>
`

fs.writeFileSync(OUT, svg)
console.log('已生成 ' + OUT)
