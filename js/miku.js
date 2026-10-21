/* ============================================================
   Miku Neon 01 —— 头图上的樱花花瓣
   只在首页/文章页的头图区域飘落，不挡正文。
   移动端与「减弱动效」下自动关闭。
   ============================================================ */
(function () {
  'use strict'

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return
  if (window.innerWidth < 768) return

  var header = document.getElementById('page-header')
  if (!header) return

  var canvas = document.createElement('canvas')
  canvas.id = 'miku-petals'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.position = 'absolute'
  canvas.style.inset = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '1'
  canvas.style.opacity = '0.55'

  var info = document.getElementById('site-info')
  header.appendChild(canvas)
  if (info) info.style.position = 'relative'

  var ctx = canvas.getContext('2d')
  var dpr = Math.min(window.devicePixelRatio || 1, 2)
  var w = 0
  var h = 0
  var petals = []
  var running = true
  var rafId = 0

  var COLORS = ['rgba(255,127,174,', 'rgba(57,197,187,', 'rgba(214,247,245,']

  function resize() {
    var rect = header.getBoundingClientRect()
    w = rect.width
    h = Math.min(rect.height, window.innerHeight)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function makePetal(initial) {
    var color = COLORS[Math.floor(Math.random() * COLORS.length)]
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -30 - Math.random() * 80,
      r: 4 + Math.random() * 6,
      vy: 0.25 + Math.random() * 0.55,
      vx: -0.22 + Math.random() * 0.44,
      rot: Math.random() * Math.PI * 2,
      vr: (-0.6 + Math.random() * 1.2) * 0.012,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.006 + Math.random() * 0.012,
      color: color,
      alpha: 0.55 + Math.random() * 0.4
    }
  }

  function drawPetal(p) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.beginPath()
    // 花瓣形状：两段二次曲线
    ctx.moveTo(0, p.r * -1.1)
    ctx.quadraticCurveTo(p.r * 1.15, 0, 0, p.r * 1.1)
    ctx.quadraticCurveTo(p.r * -1.15, 0, 0, p.r * -1.1)
    ctx.fillStyle = p.color + p.alpha.toFixed(2) + ')'
    ctx.fill()
    ctx.restore()
  }

  function frame() {
    if (!running) return
    ctx.clearRect(0, 0, w, h)
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i]
      p.sway += p.swaySpeed
      p.x += p.vx + Math.sin(p.sway) * 0.45
      p.y += p.vy
      p.rot += p.vr
      if (p.y > h + 40 || p.x < -60 || p.x > w + 60) {
        petals[i] = makePetal(false)
        continue
      }
      drawPetal(p)
    }
    rafId = window.requestAnimationFrame(frame)
  }

  function start() {
    resize()
    var count = w > 1200 ? 22 : 14
    petals = []
    for (var i = 0; i < count; i++) petals.push(makePetal(true))
    running = true
    frame()
  }

  start()

  window.addEventListener('resize', function () {
    resize()
  })

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false
      window.cancelAnimationFrame(rafId)
    } else if (!running) {
      running = true
      frame()
    }
  })
})()
