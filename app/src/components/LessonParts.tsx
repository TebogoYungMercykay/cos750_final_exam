import { Check, NotebookPen } from 'lucide-react'
import { useState } from 'react'
import { childCount, depthOf, findNode, height, parentOf, size, type Tree } from '../engine/bst'
import type { TraceKind } from '../engine/traces'
import { useProgress } from '../state/progress'
import { TreeView, type NodeState } from './TreeView'

const LEGENDS: Record<'ordered' | 'path' | 'explore', [NodeState, string][]> = {
  ordered: [
    ['current', 'current'],
    ['visited', 'visited, number is the visit order'],
  ],
  path: [
    ['current', 'current'],
    ['path', 'compared on the way'],
    ['found', 'found or inserted'],
  ],
  explore: [
    ['selected', 'selected'],
    ['related', 'its children'],
    ['stack', 'its parent'],
  ],
}

/** How waiting nodes are described for each kind of walk. They are drawn the same way for every kind. */
const WAITING: Partial<Record<TraceKind, [NodeState, string]>> = {
  pre: ['stack', 'on the call stack'],
  in: ['stack', 'on the call stack, still to be visited'],
  post: ['stack', 'on the call stack, still to be visited'],
  level: ['queue', 'waiting in the queue'],
  bfs: ['queue', 'waiting in the queue'],
  dfs: ['queue', 'waiting on the stack'],
}

/** Every style the tree can show for this kind of trace, and nothing it cannot. */
export function Legend({ kind }: { kind: TraceKind | 'explore' }) {
  const waiting = kind === 'explore' ? undefined : WAITING[kind]
  const entries =
    kind === 'explore'
      ? LEGENDS.explore
      : kind === 'search' || kind === 'insert'
        ? LEGENDS.path
        : [...LEGENDS.ordered, ...(waiting ? [waiting] : [])]
  return (
    <ul className="legend">
      {entries.map(([state, text]) => (
        <li key={state}>
          <i className={`swatch is-${state}`} aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  )
}

export function Explorer({ tree, caption }: { tree: Tree; caption: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  const n = selected === null ? null : findNode(tree, selected)
  const parent = selected === null ? null : parentOf(tree, selected)
  const role = !n
    ? ''
    : !parent
      ? 'the root (no parent)'
      : !n.left && !n.right
        ? 'a leaf (no children)'
        : 'an internal node (a parent with at least one child)'
  const state = (key: number): NodeState | '' => {
    if (key === selected) return 'selected'
    if (n && (n.left?.key === key || n.right?.key === key)) return 'related'
    if (parent?.key === key) return 'stack'
    return ''
  }

  return (
    <div className="explorer">
      <p className="muted">{caption}</p>
      <div className="explorer-grid">
        <TreeView tree={tree} label="Interactive tree explorer" state={state} onNode={setSelected} />
        <div className="explorer-info" aria-live="polite">
          {n ? (
            <dl>
              <div>
                <dt>Node</dt>
                <dd>
                  <strong>{n.key}</strong> is {role}.
                </dd>
              </div>
              <div>
                <dt>Parent</dt>
                <dd>{parent ? parent.key : 'none'}</dd>
              </div>
              <div>
                <dt>Children</dt>
                <dd>
                  {childCount(n)}: left {n.left?.key ?? 'none'}, right {n.right?.key ?? 'none'}
                </dd>
              </div>
              <div>
                <dt>Depth</dt>
                <dd>{depthOf(tree, n.key)}</dd>
              </div>
              <div>
                <dt>Subtree</dt>
                <dd>
                  {size(n)} node{size(n) > 1 ? 's' : ''}, height {height(n)}
                </dd>
              </div>
            </dl>
          ) : (
            <p>Select a node to see its parent, children, depth and subtree.</p>
          )}
          <Legend kind="explore" />
        </div>
      </div>
    </div>
  )
}

export function Reflect({ id, prompt }: { id: string; prompt: string }) {
  const { progress, saveReflection } = useProgress()
  const [text, setText] = useState(progress.reflections[id] ?? '')
  const [saved, setSaved] = useState(false)
  const field = `reflect-${id}`

  return (
    <div className="reflect">
      <label htmlFor={field} className="reflect-prompt">
        <NotebookPen size={20} aria-hidden="true" />
        {prompt}
      </label>
      <textarea
        id={field}
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setSaved(false)
        }}
        placeholder="Write a sentence or two. Explaining an idea in your own words helps you remember it."
      />
      <div className="row">
        <button
          type="button"
          className="btn"
          disabled={!text.trim()}
          onClick={() => {
            saveReflection(id, text.trim())
            setSaved(true)
          }}
        >
          Save to my notes
        </button>
        {saved && (
          <span className="saved" role="status">
            <Check size={16} aria-hidden="true" /> Saved. You will find it on the progress page.
          </span>
        )}
      </div>
    </div>
  )
}
