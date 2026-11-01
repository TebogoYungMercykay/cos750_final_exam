import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
  z: number
  level: number
}

const LEVELS = 6
const PULSE_SECONDS = 7

/**
 * A complete binary tree laid out in 3D: each level is a ring, and every node
 * owns an arc of its parent's arc, so subtrees fan out without crossing.
 */
function buildTree() {
  const points: Point[] = []
  const edges: [number, number][] = []
  const chords: [number, number][] = []
  const grow = (level: number, from: number, to: number, parent: number | null) => {
    const angle = (from + to) / 2
    const radius = level === 0 ? 0 : 0.18 + level * 0.17
    const index = points.length
    points.push({ x: Math.cos(angle) * radius, y: -0.62 + level * 0.25, z: Math.sin(angle) * radius, level })
    if (parent !== null) edges.push([parent, index])
    if (level + 1 < LEVELS) {
      const mid = (from + to) / 2
      grow(level + 1, from, mid, index)
      grow(level + 1, mid, to, index)
    }
  }
  grow(0, 0, Math.PI * 2, null)
  for (let level = 2; level < LEVELS; level++) {
    const ring = points.map((p, i) => [p, i] as const).filter(([p]) => p.level === level)
    ring.sort((a, b) => Math.atan2(a[0].z, a[0].x) - Math.atan2(b[0].z, b[0].x))
    ring.forEach(([, i], k) => chords.push([i, ring[(k + 1) % ring.length][1]]))
  }
  return { points, edges, chords }
}

function readColours() {
  const css = getComputedStyle(document.documentElement)
  return { line: css.getPropertyValue('--bg-line').trim(), glow: css.getPropertyValue('--bg-glow').trim() }
}

/** Decorative, so it is hidden from assistive technology and never takes pointer events. */
export function Background({ hero }: { hero: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef(hero)
  const redrawRef = useRef<() => void>(() => {})

  useEffect(() => {
    heroRef.current = hero
    redrawRef.current()
  }, [hero])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { points, edges, chords } = buildTree()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let colours = readColours()
    let width = 0
    let height = 0
    let frame = 0
    let last = performance.now()
    let spin = 0.6
    const view = { cx: 0, cy: 0, scale: 0, alpha: 0 }

    const target = () => {
      const narrow = width < 760
      if (heroRef.current) {
        return narrow
          ? { cx: width * 0.72, cy: height * 0.2, scale: width * 0.62, alpha: 0.4 }
          : { cx: width * 0.74, cy: height * 0.5, scale: Math.min(width, height) * 0.5, alpha: 0.7 }
      }
      return narrow
        ? { cx: width * 0.9, cy: height * 0.12, scale: width * 0.5, alpha: 0.25 }
        : { cx: width * 0.9, cy: height * 0.32, scale: Math.min(width, height) * 0.5, alpha: 0.3 }
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (view.scale === 0) Object.assign(view, target())
    }

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!still.matches) spin += dt * 0.12
      const goal = target()
      const ease = still.matches ? 1 : Math.min(1, dt * 3)
      view.cx += (goal.cx - view.cx) * ease
      view.cy += (goal.cy - view.cy) * ease
      view.scale += (goal.scale - view.scale) * ease
      view.alpha += (goal.alpha - view.alpha) * ease

      const tilt = -0.42
      const cosS = Math.cos(spin)
      const sinS = Math.sin(spin)
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)
      const projected = points.map((p) => {
        const x = p.x * cosS - p.z * sinS
        const z0 = p.x * sinS + p.z * cosS
        const y = p.y * cosT - z0 * sinT
        const z = p.y * sinT + z0 * cosT
        const depth = 2.6 / (2.6 + z)
        return { x: view.cx + x * view.scale * depth, y: view.cy + y * view.scale * depth, z }
      })

      const pulse = still.matches ? -10 : ((now / 1000) % PULSE_SECONDS) * (LEVELS / (PULSE_SECONDS * 0.6)) - 0.5
      const lit = (level: number) => Math.max(0, 1 - Math.abs(pulse - level) * 1.1)

      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = view.alpha
      ctx.lineWidth = 0.7
      ctx.strokeStyle = colours.line
      ctx.beginPath()
      for (const [a, b] of chords) {
        ctx.moveTo(projected[a].x, projected[a].y)
        ctx.lineTo(projected[b].x, projected[b].y)
      }
      ctx.globalAlpha = view.alpha * 0.45
      ctx.stroke()

      ctx.globalAlpha = view.alpha
      ctx.lineWidth = 1
      ctx.beginPath()
      for (const [a, b] of edges) {
        ctx.moveTo(projected[a].x, projected[a].y)
        ctx.lineTo(projected[b].x, projected[b].y)
      }
      ctx.stroke()

      ctx.strokeStyle = colours.glow
      ctx.lineWidth = 1.6
      for (const [a, b] of edges) {
        const glow = lit(points[b].level - 0.5)
        if (glow <= 0.02) continue
        ctx.globalAlpha = view.alpha * glow * 0.7
        ctx.beginPath()
        ctx.moveTo(projected[a].x, projected[a].y)
        ctx.lineTo(projected[b].x, projected[b].y)
        ctx.stroke()
      }

      points.forEach((p, i) => {
        const glow = lit(p.level)
        const { x, y, z } = projected[i]
        ctx.globalAlpha = view.alpha * (0.45 + glow * 0.4)
        ctx.fillStyle = glow > 0.05 ? colours.glow : colours.line
        ctx.beginPath()
        ctx.arc(x, y, 1.6 + glow * 2.6 + (1 - z) * 0.6, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      draw(now)
      if (!still.matches && !document.hidden) frame = requestAnimationFrame(loop)
    }
    const restart = () => {
      cancelAnimationFrame(frame)
      last = performance.now()
      frame = requestAnimationFrame(loop)
    }

    const themeWatch = new MutationObserver(() => {
      colours = readColours()
      restart()
    })
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const onResize = () => {
      resize()
      restart()
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', restart)
    still.addEventListener('change', restart)
    redrawRef.current = restart

    resize()
    restart()
    return () => {
      cancelAnimationFrame(frame)
      themeWatch.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', restart)
      still.removeEventListener('change', restart)
    }
  }, [])

  return <canvas ref={canvasRef} className="backdrop" aria-hidden="true" />
}
