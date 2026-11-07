import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { bodyOf, stepsFor, TOURS, type TourId } from '../content/tours'
import { useProgress, type Mode } from '../state/progress'
import { tours, useTours } from '../state/tour'

const GAP = 14
const MARGIN = 12
const CARD_WIDTH = 380
const SPOT_PAD = 8
/** Below this viewport width the card docks at the bottom instead of sitting beside its target. */
const DOCK_BELOW = 640
/** The card sits beside its target only when there is at least this much room above or below it. */
const ROOM_NEEDED = 240
const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface Box {
  top: number
  left: number
  width: number
  height: number
}

/** The tour overlay, mounted once at the root. It shows whichever tour the tour store has made active. */
export function Tour() {
  const { active } = useTours()
  const { progress, markTourSeen } = useProgress()
  if (!active) return null
  return (
    <TourRun
      key={active}
      id={active}
      mode={progress.mode}
      onEnd={() => {
        markTourSeen(active)
        tours.finish()
      }}
    />
  )
}

function placeCard(spot: Box | null): CSSProperties {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(CARD_WIDTH, vw - MARGIN * 2)
  if (!spot || vw < DOCK_BELOW) return { width, left: (vw - width) / 2, bottom: MARGIN }
  const left = Math.min(Math.max(spot.left + spot.width / 2 - width / 2, MARGIN), vw - width - MARGIN)
  const below = vh - (spot.top + spot.height)
  const above = spot.top
  if (Math.max(below, above) < ROOM_NEEDED) return { width, left, bottom: MARGIN }
  return below >= above
    ? { width, left, top: spot.top + spot.height + GAP }
    : { width, left, bottom: vh - spot.top + GAP }
}

function TourRun({ id, mode, onEnd }: { id: TourId; mode: Mode; onEnd: () => void }) {
  const steps = stepsFor(id, mode)
  const [index, setIndex] = useState(0)
  const [spot, setSpot] = useState<Box | null>(null)
  const [shown, setShown] = useState(false)
  const [opener] = useState(() => document.activeElement)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const endRef = useRef(onEnd)
  const step = steps[index]
  const last = index === steps.length - 1
  const titleId = `tour-${id}-title`
  const bodyId = `tour-${id}-body`

  useEffect(() => {
    endRef.current = onEnd
  })

  useEffect(() => {
    let frame = 0
    const target = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (step.target && (!target || !target.isConnected || target.getClientRects().length === 0)) {
          if (last) endRef.current()
          else setIndex((i) => i + 1)
          return
        }
        if (target) {
          const r = target.getBoundingClientRect()
          const top = Math.max(r.top - SPOT_PAD, 4)
          const bottom = Math.min(r.bottom + SPOT_PAD, window.innerHeight - 4)
          setSpot({ top, left: r.left - SPOT_PAD, width: r.width + SPOT_PAD * 2, height: Math.max(bottom - top, 0) })
        } else setSpot(null)
        setShown(true)
      })
    }
    target?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
    const settle = window.setTimeout(measure, reduced ? 0 : 320)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(settle)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, last])

  useEffect(() => {
    if (shown) titleRef.current?.focus({ preventScroll: true })
  }, [shown, index])

  useEffect(() => {
    const overlay = rootRef.current
    const behind = overlay?.parentElement
      ? [...overlay.parentElement.children].filter(
          (el): el is HTMLElement => el !== overlay && el instanceof HTMLElement,
        )
      : []
    for (const el of behind) el.inert = true
    return () => {
      for (const el of behind) el.inert = false
    }
  }, [])

  useEffect(
    () => () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    },
    [opener],
  )

  const next = () => (last ? onEnd() : setIndex(index + 1))
  const back = () => {
    if (index > 0) setIndex(index - 1)
  }

  const keysRef = useRef({ next, back, end: onEnd })
  useEffect(() => {
    keysRef.current = { next, back, end: onEnd }
  })

  /** Listens on the window, not the card, so the keys work before focus has reached the card. */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const action = { Escape: 'end', ArrowRight: 'next', ArrowLeft: 'back' }[e.key] as
        'end' | 'next' | 'back' | undefined
      if (!action) return
      e.preventDefault()
      keysRef.current[action]()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && cardRef.current) {
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
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        style={placeCard(spot)}
        onKeyDown={onKeyDown}
      >
        <p className="tour-count">
          <span>{TOURS[id].name}</span>
          <span>
            {index + 1} of {steps.length}
          </span>
        </p>
        <h2 id={titleId} ref={titleRef} tabIndex={-1} className="tour-title">
          {step.title}
        </h2>
        <p id={bodyId} className="tour-body">
          {bodyOf(step, mode)}
        </p>
        <ol className="tour-dots" aria-hidden="true">
          {steps.map((s, i) => (
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
