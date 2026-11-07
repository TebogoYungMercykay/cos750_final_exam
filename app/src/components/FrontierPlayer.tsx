import { useState } from 'react'
import type { Tree } from '../engine/bst'
import { FRONTIER_INTERFACE, type FrontierTraceKind } from '../engine/traces'
import { StepPlayer } from './StepPlayer'

const FRONTIERS: Record<FrontierTraceKind, string> = {
  bfs: 'Breadth first, using a queue',
  dfs: 'Depth first, using a stack',
}

/** One search loop where only the frontier changes: the contrast between breadth first and depth first. */
export function FrontierPlayer({ tree }: { tree: Tree }) {
  const [kind, setKind] = useState<FrontierTraceKind>('bfs')
  return (
    <div className="frontier">
      <fieldset className="segmented">
        <legend className="visually-hidden">Frontier</legend>
        {(Object.keys(FRONTIERS) as FrontierTraceKind[]).map((k) => (
          <label key={k} className={kind === k ? 'is-on' : undefined}>
            <input type="radio" name="frontier" checked={kind === k} onChange={() => setKind(k)} />
            {FRONTIERS[k]}
          </label>
        ))}
      </fieldset>
      <details className="interface">
        <summary>
          The <code>Frontier</code> interface both walks use
        </summary>
        <p className="muted">
          The loop below works with any class that implements it. A queue class and a stack class each do, so the same
          loop walks breadth first or depth first.
        </p>
        <pre className="code code-block">{FRONTIER_INTERFACE.join('\n')}</pre>
      </details>
      <StepPlayer key={kind} tree={tree} kind={kind} />
    </div>
  )
}
