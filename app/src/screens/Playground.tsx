import { ArrowLeft, Play, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { FrontierPlayer } from '../components/FrontierPlayer'
import { StepPlayer } from '../components/StepPlayer'
import { TreeView } from '../components/TreeView'
import { fromKeys, insert, size, type Tree } from '../engine/bst'
import type { TraceKind } from '../engine/traces'
import { depthFirstOrder } from '../engine/traversal'
import { href } from '../state/router'

const PRESETS: Record<string, number[]> = {
  'Balanced, 7 keys': [50, 30, 70, 20, 40, 60, 80],
  'Lecture example': [15, 9, 23, 4, 12, 20, 27],
  Uneven: [40, 20, 60, 10, 30, 50, 70, 25, 27],
  'Sorted input': [10, 20, 30, 40, 50, 60],
}

const MAX_NODES = 15
type Operation = TraceKind | 'frontier'

const OPERATIONS: { id: Operation; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'insert', label: 'Insert' },
  { id: 'pre', label: 'Pre-order' },
  { id: 'in', label: 'In-order' },
  { id: 'post', label: 'Post-order' },
  { id: 'level', label: 'Level-order' },
  { id: 'frontier', label: 'Queue or stack' },
]

export function Playground() {
  const [tree, setTree] = useState<Tree>(() => fromKeys(PRESETS['Lecture example']))
  const [entry, setEntry] = useState('')
  const [message, setMessage] = useState('')
  const [operation, setOperation] = useState<Operation>('search')
  const [keyText, setKeyText] = useState('20')
  const [run, setRun] = useState<{ op: Operation; key: number; tree: Tree } | null>(null)
  const needsKey = operation === 'search' || operation === 'insert'
  const key = Number(keyText)
  const keyValid = keyText.trim() !== '' && Number.isInteger(key) && key >= 0 && key <= 999

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
    if (operation === 'insert' && size(tree) < MAX_NODES) setTree(insert(tree, key))
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

      <div className="playground">
        <section className="card" aria-labelledby="build-title">
          <h2 id="build-title" className="display-4">
            Your tree
          </h2>
          <div className="preset-row" role="group" aria-label="Preset trees">
            {Object.entries(PRESETS).map(([name, keys]) => (
              <button
                type="button"
                key={name}
                className="chip-button"
                onClick={() => {
                  setTree(fromKeys(keys))
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
                setRun(null)
              }}
            >
              <Trash2 size={18} aria-hidden="true" />
              Clear
            </button>
          </div>
          {message && (
            <p className="feedback is-wrong" role="status">
              {message}
            </p>
          )}
          <TreeView tree={tree} label="Your binary search tree" />
        </section>

        <section className="card" aria-labelledby="run-title">
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
          <section className="card rise" aria-label="Animation" key={`${run.op}-${run.key}-${size(run.tree)}`}>
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
