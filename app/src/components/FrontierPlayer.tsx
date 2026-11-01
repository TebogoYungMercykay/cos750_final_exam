import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Tree } from '../engine/bst'
import { searchSteps, type FrontierKind } from '../engine/traversal'
import { Chips } from './StepPlayer'
import { TreeView, type NodeState } from './TreeView'

const FRONTIERS: Record<FrontierKind, { name: string; title: string; reads: string }> = {
  queue: { name: 'Queue', title: 'Breadth first, using a queue', reads: 'front first' },
  stack: { name: 'Stack', title: 'Depth first, using a stack', reads: 'top first' },
}

const LOOP = [
  'search(root, frontier):',
  '  frontier.add(root)',
  '  while frontier is not empty:',
  '    node ← frontier.remove()',
  '    visit(node)',
  '    frontier.add(node.left, node.right)',
]

/** One search loop where only the frontier changes: the contrast between breadth first and depth first. */
export function FrontierPlayer({ tree }: { tree: Tree }) {
  const [kind, setKind] = useState<FrontierKind>('queue')
  const [index, setIndex] = useState(0)
  const steps = useMemo(() => searchSteps(tree, kind), [tree, kind])
  const step = steps[index]
  const frontier = FRONTIERS[kind]
  const last = steps.length - 1
  const rank = new Map(step.order.map((key, i) => [key, i + 1]))

  const state = (key: number): NodeState | '' => {
    if (key === step.visited) return 'current'
    if (rank.has(key)) return 'visited'
    if (step.frontier.includes(key)) return kind === 'queue' ? 'queue' : 'stack'
    return ''
  }

  const waiting = step.frontier.length ? step.frontier.join(', ') : 'empty'
  const announcement =
    step.visited === null
      ? `Start. ${frontier.name} holds ${waiting}.`
      : `Visited ${step.visited}. ${frontier.name}: ${waiting}.`

  return (
    <section className="player" aria-labelledby="frontier-title">
      <div className="player-head">
        <h4 id="frontier-title">Walk the tree</h4>
        <fieldset className="segmented">
          <legend className="visually-hidden">Frontier</legend>
          {(Object.keys(FRONTIERS) as FrontierKind[]).map((k) => (
            <label key={k} className={kind === k ? 'is-on' : undefined}>
              <input
                type="radio"
                name="frontier"
                checked={kind === k}
                onChange={() => {
                  setKind(k)
                  setIndex(0)
                }}
              />
              {FRONTIERS[k].title}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="player-grid">
        <div className="player-stage">
          <TreeView
            tree={tree}
            label={`Binary search tree, ${frontier.title.toLowerCase()}`}
            state={state}
            badge={(key) => rank.get(key)}
          />
        </div>
        <div className="player-side">
          <pre className="code" aria-label="Pseudocode">
            {LOOP.map((line, i) => (
              <div key={i} className={i === (step.visited === null ? 1 : 4) ? 'is-active' : undefined}>
                <span className="code-num" aria-hidden="true">
                  {i + 1}
                </span>
                {line}
              </div>
            ))}
          </pre>
          <Chips label="Visit order" items={step.order} empty="nothing yet" solid />
          <Chips label={`${frontier.name}, ${frontier.reads}`} items={step.frontier} empty="empty" />
        </div>
      </div>

      <p className="narration" role="status">
        <span className="narration-step">
          Step {index} of {last}
        </span>
        {announcement}
      </p>

      <div className="controls">
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setIndex(0)}
          disabled={index === 0}
          aria-label="Restart"
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          aria-label="Back"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setIndex(index + 1)} disabled={index === last}>
          Next step
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
