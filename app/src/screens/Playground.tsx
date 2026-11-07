import { ArrowLeft, Play, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FrontierPlayer } from '../components/FrontierPlayer'
import { reveal } from '../components/reveal'
import { StepPlayer } from '../components/StepPlayer'
import { TourLauncher } from '../components/TourLauncher'
import { TreeView } from '../components/TreeView'
import { fromKeys, insert, size, type Tree } from '../engine/bst'
import { DEFAULT_PRESET, OPERATIONS, PRESETS, type Operation, type PresetId } from '../content/playground'
import { depthFirstOrder } from '../engine/traversal'
import { href } from '../state/router'

const MAX_NODES = 15
const DEFAULT_KEY = 20
const keysOf = (id: PresetId) => PRESETS.find((p) => p.id === id)!.keys

interface PlaygroundProps {
  /** Opens with this operation already running, as a review link from the readiness check does. */
  op?: Operation
  preset?: PresetId
  keyValue?: number
}

export function Playground({ op, preset: startPreset = DEFAULT_PRESET, keyValue = DEFAULT_KEY }: PlaygroundProps) {
  const [tree, setTree] = useState<Tree>(() => fromKeys(keysOf(startPreset)))
  /** The preset the tree still matches; null once the learner has added keys, inserted or cleared. */
  const [preset, setPreset] = useState<PresetId | null>(startPreset)
  const [entry, setEntry] = useState('')
  const [message, setMessage] = useState('')
  const [operation, setOperation] = useState<Operation>(op ?? 'search')
  const [keyText, setKeyText] = useState(String(keyValue))
  const [run, setRun] = useState<{ op: Operation; key: number; tree: Tree } | null>(() =>
    op ? { op, key: keyValue, tree: fromKeys(keysOf(startPreset)) } : null,
  )
  const runRef = useRef<HTMLElement>(null)
  const needsKey = operation === 'search' || operation === 'insert'
  const key = Number(keyText)
  const keyValid = keyText.trim() !== '' && Number.isInteger(key) && key >= 0 && key <= 999

  useEffect(() => {
    if (run) reveal(runRef.current)
  }, [run])

  const add = () => {
    const values = entry
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map(Number)
    if (!values.length || values.some((v) => !Number.isInteger(v) || v < 0 || v > 999)) {
      setMessage('Enter whole numbers from 0 to 999, separated by spaces or commas.')
      return
    }
    let next = tree
    const skipped: number[] = []
    for (const v of values) {
      if (size(next) >= MAX_NODES || depthFirstOrder(next, 'in').includes(v)) skipped.push(v)
      else next = insert(next, v)
    }
    setTree(next)
    if (next !== tree) setPreset(null)
    setRun(null)
    setEntry('')
    setMessage(
      skipped.length
        ? `Skipped ${skipped.join(', ')}: already in the tree, or the tree is full at ${MAX_NODES} nodes.`
        : '',
    )
  }

  const start = () => {
    if (needsKey && !keyValid) {
      setMessage('Enter a whole number from 0 to 999 as the key.')
      return
    }
    setMessage('')
    setRun({ op: operation, key, tree })
    if (operation === 'insert' && size(tree) < MAX_NODES) {
      const grown = insert(tree, key)
      if (grown !== tree) setPreset(null)
      setTree(grown)
    }
  }

  return (
    <div className="page">
      <a className="back" href={href({ name: 'home' })}>
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </a>
      <header className="page-head">
        <p className="eyebrow">Explore freely</p>
        <h1 className="display-2">
          The <em>playground</em>
        </h1>
        <p className="lede">Build any BST of up to {MAX_NODES} nodes, then watch an operation run step by step.</p>
      </header>

      <TourLauncher id="playground" />
      <div className="playground">
        <section className="card" aria-labelledby="build-title" data-tour="pg-build">
          <h2 id="build-title" className="display-4">
            Your tree
          </h2>
          <div className="preset-row" role="group" aria-label="Preset trees">
            {PRESETS.map(({ id, name, keys }) => (
              <button
                type="button"
                key={id}
                className="chip-button"
                aria-pressed={preset === id}
                onClick={() => {
                  setTree(fromKeys(keys))
                  setPreset(id)
                  setRun(null)
                  setMessage('')
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="row">
            <label className="visually-hidden" htmlFor="pg-values">
              Keys to insert
            </label>
            <input
              id="pg-values"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="Keys to insert, for example 42 17 63"
              inputMode="numeric"
            />
            <button type="button" className="btn" onClick={add}>
              <Plus size={18} aria-hidden="true" />
              Add
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                setTree(null)
                setPreset(null)
                setRun(null)
              }}
            >
              <Trash2 size={18} aria-hidden="true" />
              Clear
            </button>
          </div>
          <p className="muted tree-source" aria-live="polite">
            {preset
              ? `Using the preset: ${PRESETS.find((p) => p.id === preset)!.name}.`
              : tree === null
                ? 'The tree is empty.'
                : 'Using your own tree.'}
          </p>
          {message && (
            <p className="feedback is-wrong" role="status">
              {message}
            </p>
          )}
          <TreeView tree={tree} label="Your binary search tree" />
        </section>

        <section className="card" aria-labelledby="run-title" data-tour="pg-run">
          <h2 id="run-title" className="display-4">
            Run an operation
          </h2>
          <div className="segmented segmented-wrap" role="radiogroup" aria-label="Operation">
            {OPERATIONS.map((o) => (
              <button
                type="button"
                key={o.id}
                role="radio"
                aria-checked={operation === o.id}
                className={operation === o.id ? 'is-on' : undefined}
                onClick={() => setOperation(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="row">
            {needsKey && (
              <label className="inline-field">
                Key
                <input value={keyText} onChange={(e) => setKeyText(e.target.value)} inputMode="numeric" size={5} />
              </label>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={start}
              disabled={tree === null && operation !== 'insert'}
            >
              <Play size={18} aria-hidden="true" />
              Run
            </button>
          </div>
        </section>

        {run && (
          <section
            className="card rise reveal-target"
            aria-label="Animation"
            key={`${run.op}-${run.key}-${size(run.tree)}`}
            ref={runRef}
            tabIndex={-1}
          >
            {run.op === 'frontier' ? (
              <FrontierPlayer tree={run.tree} />
            ) : (
              <StepPlayer tree={run.tree} kind={run.op} keyValue={run.key} />
            )}
          </section>
        )}
      </div>
    </div>
  )
}
