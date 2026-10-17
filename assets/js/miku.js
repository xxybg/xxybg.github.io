/* Miku Theme 交互脚本：零依赖 */
(() => {
  const docEl = document.documentElement
  docEl.classList.add('js')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------- 昼 / 夜 ---------- */
  const themeBtn = document.getElementById('theme-toggle')
  themeBtn?.addEventListener('click', () => {
    const next = docEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
    docEl.setAttribute('data-theme', next)
    try {
      localStorage.setItem('miku-theme', next)
    } catch (e) {
      /* 忽略隐私模式报错 */
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', next === 'light' ? '#f2fbfa' : '#0b1119')
  })

  /* ---------- 移动端菜单 ---------- */
  const navToggle = document.getElementById('nav-toggle')
  const nav = document.getElementById('nav')
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open')
      navToggle.setAttribute('aria-expanded', String(open))
      document.body.classList.toggle('is-nav-open', open)
    })
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open')
        navToggle.setAttribute('aria-expanded', 'false')
        document.body.classList.remove('is-nav-open')
      }
    })
  }

  /* ---------- 滚动进度 / 头部状态 / 回顶 ---------- */
  const progress = document.getElementById('scroll-progress')
  const header = document.getElementById('site-header')
  const toTop = document.getElementById('to-top')

  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`
      header?.classList.toggle('is-scrolled', y > 12)
      toTop?.classList.toggle('is-on', y > 560)
      ticking = false
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  })

  /* ---------- 入场动画 ---------- */
  const reveals = document.querySelectorAll('.reveal')
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )
    reveals.forEach((el) => io.observe(el))
  } else {
    reveals.forEach((el) => el.classList.add('is-in'))
  }

  /* ---------- 首屏打字机 ---------- */
  const typed = document.querySelector('.typed[data-typing]')
  if (typed) {
    let phrases = []
    try {
      phrases = JSON.parse(typed.dataset.typing)
    } catch (e) {
      phrases = []
    }
    if (!Array.isArray(phrases) || !phrases.length) phrases = [typed.textContent || '']

    if (reduceMotion) {
      typed.textContent = phrases[0]
    } else {
      let pi = 0
      let ci = 0
      let deleting = false
      const tick = () => {
        const word = phrases[pi % phrases.length]
        ci += deleting ? -1 : 1
        typed.textContent = word.slice(0, ci)
        let delay = deleting ? 45 : 105
        if (!deleting && ci === word.length) {
          deleting = true
          delay = 1900
        } else if (deleting && ci === 0) {
          deleting = false
          pi++
          delay = 320
        }
        setTimeout(tick, delay)
      }
      setTimeout(tick, 500)
    }
  }

  /* ---------- hero 声波 ---------- */
  const canvas = document.getElementById('wave-canvas')
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let t = 0

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const scale = dpr()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      canvas.width = w * scale
      canvas.height = h * scale
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      draw()
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      if (!w || !h) return
      const mid = h * 0.62
      const waves = [
        { amp: h * 0.22, freq: 0.0042, speed: 0.6, color: 'rgba(57,197,187,0.55)', width: 2 },
        { amp: h * 0.14, freq: 0.0071, speed: -0.9, color: 'rgba(95,227,216,0.38)', width: 1.6 },
        { amp: h * 0.3, freq: 0.0026, speed: 0.32, color: 'rgba(255,127,174,0.3)', width: 1.4 }
      ]
      for (const wave of waves) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const y =
            mid +
            Math.sin(x * wave.freq + t * wave.speed) * wave.amp * (0.55 + 0.45 * Math.sin(x * 0.0016 + t * 0.2)) +
            Math.sin(x * wave.freq * 2.7 + t * wave.speed * 1.7) * wave.amp * 0.28
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = wave.color
        ctx.lineWidth = wave.width
        ctx.stroke()
      }
      // 均衡器柱
      const bars = Math.min(56, Math.floor(w / 22))
      const gap = w / bars
      for (let i = 0; i < bars; i++) {
        const bx = i * gap + gap * 0.35
        const bh = (0.2 + 0.8 * Math.abs(Math.sin(i * 0.6 + t * 1.4) * Math.cos(i * 0.21 - t * 0.7))) * h * 0.5
        const g = ctx.createLinearGradient(0, h - bh, 0, h)
        g.addColorStop(0, 'rgba(95,227,216,0)')
        g.addColorStop(1, 'rgba(57,197,187,0.30)')
        ctx.fillStyle = g
        ctx.fillRect(bx, h - bh, Math.max(1.5, gap * 0.3), bh)
      }
    }

    const loop = () => {
      t += 0.018
      draw()
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (raf || reduceMotion) return
      loop()
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    window.addEventListener('resize', resize)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting
        if (visible && document.visibilityState === 'visible') start()
        else stop()
      }).observe(canvas)
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && visible) start()
      else stop()
    })
    resize()
    if (reduceMotion) draw()
    else start()
  }

  /* ---------- 代码复制 ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const block = btn.closest('.code-block')
      const code = block?.querySelector('code')
      if (!code) return
      const text = code.textContent
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
        else {
          const ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          ta.remove()
        }
        btn.textContent = '已复制'
        btn.classList.add('is-done')
        setTimeout(() => {
          btn.textContent = '复制'
          btn.classList.remove('is-done')
        }, 1600)
      } catch (e) {
        btn.textContent = '复制失败'
        setTimeout(() => (btn.textContent = '复制'), 1600)
      }
    })
  })

  /* ---------- 目录高亮 ---------- */
  const tocLinks = [...document.querySelectorAll('.toc a')]
  if (tocLinks.length) {
    const targets = tocLinks
      .map((a) => {
        const id = decodeURIComponent(a.getAttribute('href').slice(1))
        const el = document.getElementById(id)
        return el ? { link: a, el } : null
      })
      .filter(Boolean)

    const highlight = () => {
      const offset = window.innerHeight * 0.28
      let current = targets[0]
      for (const item of targets) {
        if (item.el.getBoundingClientRect().top <= offset) current = item
      }
      targets.forEach((item) => item.link.classList.toggle('is-active', item === current))
    }
    window.addEventListener('scroll', highlight, { passive: true })
    highlight()
  }
})()
