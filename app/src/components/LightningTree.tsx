import { useEffect, useRef } from 'react'
import { type Tree } from '../engine/bst'
import { layoutTree } from '../engine/layout'
import { planWindow, SHOW_MS, strike, WINDOW_MS, type Strike } from './lightning'

const WIDTH = 240
const HEIGHT = 170
const PAD = 16
const SKY = 26
/** Time for the bolt to cross one edge. */
const HOP_MS = 260
const FADE_MS = 450

interface Point {
  x: number
  y: number
}

/** Where every node sits, using the larger of the two trees so nothing moves while a node comes or goes. */
function positions(tree: Tree): Map<number, Point> {
  const { nodes, columns, depth } = layoutTree(tree)
  const stepX = (WIDTH - PAD * 2) / Math.max(1, columns - 1)
  const stepY = (HEIGHT - PAD - SKY - 8) / Math.max(1, depth)
  return new Map(nodes.map((n) => [n.key, { x: PAD + n.column * stepX, y: SKY + n.depth * stepY }]))
}

function edgesOf(tree: Tree): [number, number][] {
  const out: [number, number][] = []
  const walk = (n: Tree) => {
    if (n === null) return
    for (const child of [n.left, n.right]) {
      if (child) {
        out.push([n.key, child.key])
        walk(child)
      }
    }
  }
  walk(tree)
  return out
}

/** A jagged line between two points that changes every frame, which is what makes it read as lightning. */
function bolt(ctx: CanvasRenderingContext2D, a: Point, b: Point, upTo = 1) {
  const end = { x: a.x + (b.x - a.x) * upTo, y: a.y + (b.y - a.y) * upTo }
  const length = Math.hypot(end.x - a.x, end.y - a.y)
  const nx = -(end.y - a.y) / (length || 1)
  const ny = (end.x - a.x) / (length || 1)
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  const kinks = 5
  for (let i = 1; i < kinks; i++) {
    const t = i / kinks
    const jitter = (Math.random() - 0.5) * 7
    ctx.lineTo(a.x + (end.x - a.x) * t + nx * jitter, a.y + (end.y - a.y) * t + ny * jitter)
  }
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function draw(ctx: CanvasRenderingContext2D, s: Strike, t: number, colours: { line: string; glow: string }) {
  const big = s.variant === 'insert' ? s.after : s.before
  const at = positions(big)
  const root = at.get(s.path[0])!
  /** The bolt comes down from above the root, follows the search path, and for an insert reaches the empty spot. */
  const points = [{ x: root.x, y: 0 }, ...s.path.map((k) => at.get(k)!)]
  if (s.variant === 'insert') points.push(at.get(s.key)!)
  const boltEnd = 400 + (points.length - 1) * HOP_MS
  const actEnd = boltEnd + 700
  const fadeIn = Math.min(1, t / 400)
  const fadeOut = Math.min(1, Math.max(0, (SHOW_MS - t) / FADE_MS))
  const alpha = fadeIn * fadeOut
  const gone = s.variant === 'insert' ? null : s.variant === 'delete-leaf' ? s.key : s.predecessor!
  const leaving = Math.min(1, Math.max(0, (t - boltEnd - 300) / 400))
  const shownTree = s.variant === 'insert' && t < boltEnd ? s.before : big

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.globalAlpha = alpha * 0.55
  ctx.strokeStyle = colours.line
  ctx.lineWidth = 1.5
  for (const [a, b] of edgesOf(shownTree)) {
    if (b === gone) ctx.globalAlpha = alpha * 0.55 * (1 - leaving)
    ctx.beginPath()
    ctx.moveTo(at.get(a)!.x, at.get(a)!.y)
    ctx.lineTo(at.get(b)!.x, at.get(b)!.y)
    ctx.stroke()
    ctx.globalAlpha = alpha * 0.55
  }
  for (const key of at.keys()) {
    if (s.variant === 'insert' && key === s.key && t < boltEnd) continue
    const flicker = key === gone && t > boltEnd && t < boltEnd + 300 ? Math.round(t / 60) % 2 : 1
    ctx.globalAlpha = alpha * 0.8 * (key === gone ? (1 - leaving) * flicker : 1)
    ctx.fillStyle = colours.line
    ctx.beginPath()
    ctx.arc(at.get(key)!.x, at.get(key)!.y, 3.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = colours.glow
  ctx.fillStyle = colours.glow
  ctx.lineWidth = 1.6
  ctx.shadowColor = colours.glow
  ctx.shadowBlur = 8
  for (let i = 0; i < points.length - 1; i++) {
    const start = 400 + i * HOP_MS
    if (t < start) break
    const progress = Math.min(1, (t - start) / HOP_MS)
    const afterglow = Math.max(0, 1 - (t - start - HOP_MS) / 900)
    ctx.globalAlpha = alpha * (progress < 1 ? 1 : afterglow)
    if (ctx.globalAlpha > 0.02) bolt(ctx, points[i], points[i + 1], progress)
    if (progress === 1 && afterglow > 0) {
      ctx.beginPath()
      ctx.arc(points[i + 1].x, points[i + 1].y, 3.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (s.variant === 'delete-by-copying' && t > boltEnd && t < actEnd) {
    const from = at.get(s.predecessor!)!
    const to = at.get(s.key)!
    const k = Math.min(1, (t - boltEnd) / 450)
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k, 4.2, 0, Math.PI * 2)
    ctx.fill()
  }
  if (s.variant === 'insert' && t > boltEnd - HOP_MS) {
    const p = at.get(s.key)!
    ctx.globalAlpha = alpha * Math.max(0.35, 1 - (t - boltEnd) / 1400)
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.shadowBlur = 0
  ctx.globalAlpha = 1
}

/**
 * A small tree in the corner that lightning strikes now and then: an insert,
 * a leaf deletion, or a deletion by copying, each a real BST step from the
 * engine. Decorative, so hidden from assistive technology; it does nothing
 * when the learner prefers reduced motion, and skips strikes while the tab
 * is hidden.
 */
export function LightningTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = WIDTH * ratio
    canvas.height = HEIGHT * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const timers: number[] = []
    let frame = 0

    const play = (s: Strike) => {
      if (document.hidden) return
      const css = getComputedStyle(document.documentElement)
      const colours = { line: css.getPropertyValue('--bg-line').trim(), glow: css.getPropertyValue('--bg-glow').trim() }
      const began = performance.now()
      canvas.dataset.strike = s.variant
      const tick = (now: number) => {
        const t = now - began
        if (t >= SHOW_MS) {
          ctx.clearRect(0, 0, WIDTH, HEIGHT)
          delete canvas.dataset.strike
          return
        }
        draw(ctx, s, t, colours)
        frame = requestAnimationFrame(tick)
      }
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(tick)
    }

    const openWindow = () => {
      for (const show of planWindow(Math.random)) {
        timers.push(window.setTimeout(() => play(strike(show.variant, Math.random)), show.at))
      }
      timers.push(window.setTimeout(openWindow, WINDOW_MS))
    }
    openWindow()

    return () => {
      for (const id of timers) window.clearTimeout(id)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="lightning" aria-hidden="true" />
}
