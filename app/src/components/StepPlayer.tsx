import { ChevronLeft, ChevronRight, Compass, Lightbulb, LifeBuoy, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SPEED } from '../content/modes'
import type { Tree } from '../engine/bst'
import {
  CODE_NOTES,
  frontierTrace,
  insertTrace,
  CODE,
  searchTrace,
  TRACE_TITLES,
  traversalTrace,
  TRAVERSALS,
  type TraceKind,
  type TraceStep,
} from '../engine/traces'
import { useProgress } from '../state/progress'
import { Legend } from './LessonParts'
import { TourLauncher } from './TourLauncher'
import { TreeView, type NodeState } from './TreeView'

interface StepPlayerProps {
  tree: Tree
  kind: TraceKind
  keyValue?: number
  callout?: string
}

const SPEEDS = [
  { label: 'Slow', ms: 2200 },
  { label: 'Relaxed', ms: SPEED.guided },
  { label: 'Normal', ms: SPEED.standard },
  { label: 'Fast', ms: 500 },
]

function trace(tree: Tree, kind: TraceKind, key: number): { steps: TraceStep[]; result: Tree } {
  if (kind === 'search') return { steps: searchTrace(tree, key), result: tree }
  if (kind === 'insert') return insertTrace(tree, key)
  if (kind === 'bfs' || kind === 'dfs') return { steps: frontierTrace(tree, kind, key), result: tree }
  return { steps: traversalTrace(tree, kind), result: tree }
}

interface Memory {
  label: string
  items: number[]
  empty: string
  solid?: boolean
}

/** What the code is keeping track of. Every list reads next one out first, so they all read the same way. */
function memory(kind: TraceKind, step: TraceStep): Memory[] {
  if (kind === 'search' || kind === 'insert')
    return [{ label: 'Compared so far', items: step.path, empty: 'nothing yet' }]
  const output: Memory = {
    label: kind === 'bfs' || kind === 'dfs' ? 'Visit order' : 'Output',
    items: step.output,
    empty: 'nothing yet',
    solid: true,
  }
  if (kind === 'level' || kind === 'bfs')
    return [{ label: 'Queue, next out first', items: step.queue, empty: 'empty' }, output]
  if (kind === 'dfs') return [{ label: 'Stack, next out (top) first', items: step.queue, empty: 'empty' }, output]
  return [{ label: 'Call stack, running call first', items: [...step.stack].reverse(), empty: 'empty' }, output]
}

export function StepPlayer({ tree, kind, keyValue = 0, callout }: StepPlayerProps) {
  const { progress } = useProgress()
  const guided = progress.mode === 'guided'
  const { all, result } = useMemo(() => {
    const t = trace(tree, kind, keyValue)
    return { all: t.steps, result: t.result }
  }, [tree, kind, keyValue])
  const steps = useMemo(() => (guided ? all : all.filter((s) => !s.detail)), [all, guided])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(SPEED[progress.mode])
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

  const step = steps[Math.min(index, last)]

  /** In guided mode the reason is read too, so listening gives the same explanation as reading. */
  const spoken = guided && step.why ? `${step.text} ${step.why}` : step.text
  useEffect(() => {
    if (!progress.narrate || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(spoken))
    return () => window.speechSynthesis.cancel()
  }, [progress.narrate, spoken])

  const ordered = kind in TRAVERSALS || kind === 'bfs' || kind === 'dfs'
  const shown = kind === 'insert' && (step.ghost || step.inserted !== undefined) ? result : tree
  const rank = new Map(step.output.map((key, i) => [key, i + 1]))
  const state = (key: number): NodeState | '' => {
    if (kind === 'insert' && step.ghost?.key === key) return 'ghost'
    if (step.done && key === step.current && (step.found || step.inserted === key)) return 'found'
    if (key === step.current) return 'current'
    if (ordered && rank.has(key)) return 'visited'
    if (!ordered && step.path.includes(key)) return 'path'
    if (step.stack.includes(key)) return 'stack'
    if (step.queue.includes(key)) return 'queue'
    return ''
  }
  const note = (key: number) => (key === step.current ? step.note : undefined)
  const keyed = kind === 'search' || kind === 'insert' || kind === 'bfs' || kind === 'dfs'
  const title = `${TRACE_TITLES[kind]}${keyed ? `, key ${keyValue}` : ''}`
  const traversal = kind in TRAVERSALS ? TRAVERSALS[kind as keyof typeof TRAVERSALS] : null
  const ModeIcon = guided ? LifeBuoy : Compass

  return (
    <div className="player">
      <TourLauncher id="player" />
      <div className="player-head">
        <h4>{title}</h4>
        <div className="row">
          {traversal && (
            <span className="pill">
              {traversal.family}: {traversal.rule}
            </span>
          )}
          <span className={`pill pill-mode${guided ? ' is-guided' : ''}`} data-tour="player-mode">
            <ModeIcon size={14} aria-hidden="true" />
            {guided ? 'Guided: every line, with reasons' : 'Standard: key steps'}
          </span>
        </div>
      </div>

      <div className="player-grid">
        <div className="player-stage" data-tour="player-tree">
          <TreeView
            tree={shown}
            label={`${TRACE_TITLES[kind]} in progress`}
            state={state}
            badge={ordered ? (key) => rank.get(key) : undefined}
            notes={guided ? note : undefined}
          />
          <Legend kind={kind} />
        </div>

        <div className="player-side">
          <div className="code-box" data-tour="player-code">
            <p className="code-lang">Java</p>
            <pre className="code" aria-label="Code">
              {CODE[kind].map((line, i) => (
                <div key={i} className={i === step.line ? 'is-active' : undefined}>
                  <span className="code-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="code-text">{line}</span>
                </div>
              ))}
            </pre>
            {guided && (
              <p className="code-note">
                <strong>Line {step.line + 1}.</strong> {CODE_NOTES[kind][step.line]}
              </p>
            )}
          </div>
          <div className="memory" data-tour="player-memory">
            {memory(kind, step).map((m) => (
              <Chips key={m.label} {...m} />
            ))}
          </div>
        </div>
      </div>

      <div className="narration" aria-live="polite" data-tour="player-narration">
        <span className="narration-step">
          Step {index + 1} of {steps.length}
        </span>
        <p>{step.text}</p>
        {guided && step.why && (
          <p className="narration-why">
            <Lightbulb size={16} aria-hidden="true" />
            <span>
              <strong>Why:</strong> {step.why}
            </span>
          </p>
        )}
      </div>
      {callout && step.done && <p className="callout">{callout}</p>}

      <div className="meter" aria-hidden="true">
        <span style={{ width: `${(index / Math.max(1, last)) * 100}%` }} />
      </div>

      <div className="controls" data-tour="player-controls">
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => stepTo(0)}
          disabled={index === 0}
          aria-label="Restart"
        >
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
          {running ? 'Pause' : index >= last ? 'Play again' : 'Play'}
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

export function Chips({ label, items, empty, solid }: Memory) {
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
