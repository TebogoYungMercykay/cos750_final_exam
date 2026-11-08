import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { bodyOf, TOUR } from '../content/tours'
import { useProgress, type Mode } from '../state/progress'
import { go, href, parseRoute } from '../state/router'
import { tours, useTourActive } from '../state/tour'

const GAP = 14
const MARGIN = 12
const CARD_WIDTH = 380
const SPOT_PAD = 8
/** Below this viewport width the card docks at the bottom instead of sitting beside its target. */
const DOCK_BELOW = 640
/** The least room the card is given beside its target, before its real height is known. */
const ROOM_NEEDED = 240
/** How long a step waits for its page to render its target before skipping it. */
const WAIT_TRIES = 20
const WAIT_MS = 100
const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
const KEYS: Record<string, 'end' | 'next' | 'back'> = { Escape: 'end', ArrowRight: 'next', ArrowLeft: 'back' }

interface Box {
  top: number
  left: number
  width: number
  height: number
}

/** The tour overlay, mounted once at the root. Finishing or skipping marks the tour done and returns to the home page. */
export function Tour() {
  const active = useTourActive()
  const { progress, update } = useProgress()
  if (!active) return null
  return (
    <TourRun
      mode={progress.mode}
      onEnd={() => {
        update({ tourDone: true })
        tours.finish()
        go({ name: 'home' })
      }}
    />
  )
}

/** Beside the target when the whole card fits there, below it first; otherwise docked at the bottom of the screen. */
function placeCard(spot: Box | null, cardHeight: number): CSSProperties {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(CARD_WIDTH, vw - MARGIN * 2)
  const docked = { width, left: (vw - width) / 2, bottom: MARGIN }
  if (!spot || vw < DOCK_BELOW) return docked
  const left = Math.min(Math.max(spot.left + spot.width / 2 - width / 2, MARGIN), vw - width - MARGIN)
  const needed = Math.max(cardHeight, ROOM_NEEDED) + GAP + MARGIN
  if (vh - (spot.top + spot.height) >= needed) return { width, left, top: spot.top + spot.height + GAP }
  if (spot.top >= needed) return { width, left, bottom: vh - spot.top + GAP }
  return docked
}

/** Everything but the tour is inert while it shows, so keyboard and screen reader users stay in the card. */
function setBehind(overlay: HTMLElement | null, on: boolean) {
  for (const el of overlay?.parentElement?.children ?? []) {
    if (el !== overlay && el instanceof HTMLElement) el.inert = on
  }
}

function TourRun({ mode, onEnd }: { mode: Mode; onEnd: () => void }) {
  const [index, setIndex] = useState(0)
  /** Which way the learner is moving, so a step whose target never appears is skipped in that direction. */
  const [direction, setDirection] = useState<1 | -1>(1)
  const [spot, setSpot] = useState<Box | null>(null)
  const [cardHeight, setCardHeight] = useState(0)
  const [bodyScrolls, setBodyScrolls] = useState(false)
  const [shown, setShown] = useState(false)
  const [opener] = useState(() => document.activeElement)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const endRef = useRef(onEnd)
  const step = TOUR[index]
  const last = index === TOUR.length - 1

  useEffect(() => {
    endRef.current = onEnd
  })

  useEffect(() => {
    if (href(parseRoute(window.location.hash)) !== href(step.route)) go(step.route)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let timer = 0
    let tries = 0
    let target: HTMLElement | null = null

    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (target) {
          const r = target.getBoundingClientRect()
          const top = Math.max(r.top - SPOT_PAD, 4)
          const bottom = Math.min(r.bottom + SPOT_PAD, window.innerHeight - 4)
          setSpot({ top, left: r.left - SPOT_PAD, width: r.width + SPOT_PAD * 2, height: Math.max(bottom - top, 0) })
        } else setSpot(null)
        setCardHeight(cardRef.current?.offsetHeight ?? 0)
        const body = bodyRef.current
        setBodyScrolls(body !== null && body.scrollHeight > body.clientHeight)
        setShown(true)
        // A new page replaces the main element, so the page behind is made inert again on every step.
        setBehind(rootRef.current, true)
        if (!cardRef.current?.contains(document.activeElement)) titleRef.current?.focus({ preventScroll: true })
      })
    }

    const locate = () => {
      target = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null
      if (step.target && (!target || target.getClientRects().length === 0)) {
        if (++tries < WAIT_TRIES) {
          timer = window.setTimeout(locate, WAIT_MS)
          return
        }
        const skipTo = index + direction
        if (skipTo < 0 || skipTo >= TOUR.length) endRef.current()
        else setIndex(skipTo)
        return
      }
      target?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
      timer = window.setTimeout(measure, reduced ? 0 : 320)
    }

    timer = window.setTimeout(locate, WAIT_MS)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, index, direction])

  useEffect(() => {
    // Read once while mounted: by cleanup the overlay has left the page and no longer has a parent.
    const page = rootRef.current?.parentElement
    return () => {
      for (const el of page?.children ?? []) if (el instanceof HTMLElement) el.inert = false
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [opener])

  const next = () => {
    if (last) return onEnd()
    setDirection(1)
    setIndex(index + 1)
  }
  const back = () => {
    if (index === 0) return
    setDirection(-1)
    setIndex(index - 1)
  }

  const keysRef = useRef({ next, back, end: onEnd })
  useEffect(() => {
    keysRef.current = { next, back, end: onEnd }
  })

  /** Listens on the window, not the card, so the keys work before focus has reached the card. */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const action = KEYS[e.key]
      if (!action) return
      e.preventDefault()
      keysRef.current[action]()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !cardRef.current) return
    const items = [...cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = items[0]
    const end = items[items.length - 1]
    const at = document.activeElement
    if (e.shiftKey && (at === first || at === titleRef.current)) {
      e.preventDefault()
      end.focus()
    } else if (!e.shiftKey && at === end) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div ref={rootRef} className={`tour${shown ? ' is-shown' : ''}`}>
      <div className={`tour-scrim${spot ? '' : ' is-dark'}`} aria-hidden="true" />
      {spot && <div className="tour-spot" style={spot} aria-hidden="true" />}
      <div
        ref={cardRef}
        className="tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        style={placeCard(spot, cardHeight)}
        onKeyDown={onKeyDown}
      >
        <p className="tour-count">
          <span>Getting started</span>
          <span>
            {index + 1} of {TOUR.length}
          </span>
        </p>
        <h2 id="tour-title" ref={titleRef} tabIndex={-1} className="tour-title">
          {step.title}
        </h2>
        <p id="tour-body" className="tour-body" ref={bodyRef} tabIndex={bodyScrolls ? 0 : undefined}>
          {bodyOf(step, mode)}
        </p>
        <ol className="tour-dots" aria-hidden="true">
          {TOUR.map((s, i) => (
            <li key={s.title} className={i === index ? 'is-now' : i < index ? 'is-done' : undefined} />
          ))}
        </ol>
        <div className="tour-actions">
          {!last && (
            <button type="button" className="btn btn-quiet" onClick={onEnd}>
              Skip tour
            </button>
          )}
          <span className="tour-spacer" />
          {index > 0 && (
            <button type="button" className="btn" onClick={back}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={next}>
            {last ? 'Done' : 'Next'}
            {last ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}
