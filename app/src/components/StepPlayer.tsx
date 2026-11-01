import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Tree } from '../engine/bst'
import {
  insertTrace,
  PSEUDOCODE,
  searchTrace,
  TRACE_TITLES,
  traversalTrace,
  TRAVERSALS,
  type TraceKind,
} from '../engine/traces'
import { useProgress } from '../state/progress'
import { Legend } from './LessonParts'
import { TreeView, type NodeState } from './TreeView'

interface StepPlayerProps {
  tree: Tree
  kind: TraceKind
  keyValue?: number
  callout?: string
}

const SPEEDS = [
  { label: 'Slow', ms: 2200 },
  { label: 'Relaxed', ms: 1600 },
  { label: 'Normal', ms: 1000 },
  { label: 'Fast', ms: 500 },
]

export function StepPlayer({ tree, kind, keyValue = 0, callout }: StepPlayerProps) {
  const { progress } = useProgress()
  const { steps, result } = useMemo(() => {
    if (kind === 'search') return { steps: searchTrace(tree, keyValue), result: tree }
    if (kind === 'insert') return insertTrace(tree, keyValue)
    return { steps: traversalTrace(tree, kind), result: tree }
  }, [tree, kind, keyValue])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(progress.mode === 'guided' ? 1600 : 1000)
  const [traced, setTraced] = useState(steps)
  const last = steps.length - 1
  const running = playing && index < last

  if (traced !== steps) {
    setTraced(steps)
    setIndex(0)
    setPlaying(false)
  }

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setIndex((i) => Math.min(i + 1, last)), speed)
    return () => window.clearTimeout(timer)
  }, [running, index, last, speed])

  const stepTo = (i: number) => {
    setPlaying(false)
    setIndex(i)
  }

  const step = steps[index]
  const traversal = kind in TRAVERSALS
  const shown = kind === 'insert' && (step.ghost || step.inserted !== undefined) ? result : tree
  const rank = new Map(step.output.map((key, i) => [key, i + 1]))
  const state = (key: number): NodeState | '' => {
    if (kind === 'insert' && step.ghost?.key === key) return 'ghost'
    if (step.done && key === step.current && (step.found || step.inserted === key)) return 'found'
    if (key === step.current) return 'current'
    if (traversal && rank.has(key)) return 'visited'
    if (!traversal && step.path.includes(key)) return 'path'
    if (step.stack.includes(key)) return 'stack'
    if (step.queue.includes(key)) return 'queue'
    return ''
  }
  const title = `${TRACE_TITLES[kind]}${kind === 'search' || kind === 'insert' ? `, key ${keyValue}` : ''}`

  return (
    <div className="player">
      <div className="player-head">
        <h4>{title}</h4>
        {traversal && (
          <span className="pill">
            {TRAVERSALS[kind as keyof typeof TRAVERSALS].family}: {TRAVERSALS[kind as keyof typeof TRAVERSALS].rule}
          </span>
        )}
      </div>

      <div className="player-grid">
        <div className="player-stage">
          <TreeView
            tree={shown}
            label={`${TRACE_TITLES[kind]} in progress`}
            state={state}
            badge={traversal ? (key) => rank.get(key) : undefined}
          />
          <Legend kind={kind} />
        </div>

        <div className="player-side">
          <pre className="code" aria-label="Pseudocode">
            {PSEUDOCODE[kind].map((line, i) => (
              <div key={i} className={i === step.line ? 'is-active' : undefined}>
                <span className="code-num" aria-hidden="true">
                  {i + 1}
                </span>
                {line}
              </div>
            ))}
          </pre>
          {traversal && kind !== 'level' && (
            <Chips label="Call stack, top on the right" items={step.stack} empty="empty" />
          )}
          {kind === 'level' && <Chips label="Queue, front on the left" items={step.queue} empty="empty" />}
          {traversal && <Chips label="Output" items={step.output} empty="nothing yet" solid />}
        </div>
      </div>

      <p className="narration" aria-live="polite">
        <span className="narration-step">
          Step {index + 1} of {steps.length}
        </span>
        {step.text}
      </p>
      {callout && step.done && <p className="callout">{callout}</p>}

      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(index / Math.max(1, last)) * 100}%` }} />
      </div>

      <div className="controls">
        <button type="button" className="btn btn-icon" onClick={() => stepTo(0)} aria-label="Restart">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => stepTo(Math.max(0, index - 1))}
          disabled={index === 0}
          aria-label="Previous step"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (index >= last) setIndex(0)
            setPlaying(!running)
          }}
        >
          {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {running ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => stepTo(Math.min(last, index + 1))}
          disabled={index >= last}
          aria-label="Next step"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <label className="speed">
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {SPEEDS.map((s) => (
              <option key={s.ms} value={s.ms}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export function Chips({
  label,
  items,
  empty,
  solid,
}: {
  label: string
  items: number[]
  empty: string
  solid?: boolean
}) {
  return (
    <div className="chips-box">
      <div className="chips-label">{label}</div>
      {items.length ? (
        <ol className={`chips${solid ? ' is-solid' : ''}`} aria-label={label}>
          {items.map((key, i) => (
            <li key={`${key}-${i}`}>{key}</li>
          ))}
        </ol>
      ) : (
        <p className="chips-empty">{empty}</p>
      )}
    </div>
  )
}
