import type { KeyboardEvent } from 'react'
import type { Tree } from '../engine/bst'
import { layoutTree, type PlacedSlot } from '../engine/layout'
import { levels } from '../engine/traversal'

export type NodeState =
  | 'current'
  | 'visited'
  | 'path'
  | 'stack'
  | 'queue'
  | 'found'
  | 'correct'
  | 'wrong'
  | 'violation'
  | 'ghost'
  | 'dim'
  | 'selected'
  | 'related'

interface TreeViewProps {
  tree: Tree
  label: string
  state?: (key: number) => NodeState | '' | undefined
  badge?: (key: number) => number | null | undefined
  onNode?: (key: number) => void
  slots?: boolean
  onSlot?: (slot: PlacedSlot) => void
  slotState?: (slot: PlacedSlot) => 'correct' | 'wrong' | ''
  compact?: boolean
}

const PAD = 30

const activate = (run: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    run()
  }
}

export function TreeView({
  tree,
  label,
  state,
  badge,
  onNode,
  slots = false,
  onSlot,
  slotState,
  compact,
}: TreeViewProps) {
  const layout = layoutTree(tree, slots)
  if (tree === null && !slots) return <p className="tree-empty">The tree is empty. Add a key to start.</p>

  const gapX = slots ? 42 : compact ? 46 : 58
  const gapY = compact ? 64 : 76
  const r = compact ? 17 : 21
  const width = Math.max(1, layout.columns) * gapX + PAD * 2
  const height = layout.depth * gapY + PAD * 2
  const x = (column: number) => PAD + column * gapX + gapX / 2
  const y = (depth: number) => PAD + depth * gapY
  const at = new Map(layout.nodes.map((n) => [n.key, n]))
  const interactive = Boolean(onNode || onSlot)
  const description = levels(tree)
    .map((keys, i) => `Depth ${i}: ${keys.join(', ')}.`)
    .join(' ')

  return (
    <figure className="tree-figure">
      <svg
        className="tree"
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: Math.max(width, 240) * 1.3 }}
        role={interactive ? 'group' : 'img'}
        aria-label={interactive ? label : `${label}. ${description}`}
      >
        {layout.edges.map(({ from, to }) => {
          const a = at.get(from)!
          const b = at.get(to)!
          const ghost = state?.(to) === 'ghost'
          return (
            <line
              key={`${from}-${to}`}
              className={`tree-edge${ghost ? ' is-ghost' : ''}`}
              x1={x(a.column)}
              y1={y(a.depth)}
              x2={x(b.column)}
              y2={y(b.depth)}
            />
          )
        })}

        {layout.slots.map((slot) => {
          const parent = slot.parent === null ? null : at.get(slot.parent)!
          const cx = x(slot.column)
          const cy = y(slot.depth)
          const name = slot.parent === null ? 'Empty tree, root position' : `Empty ${slot.side} child of ${slot.parent}`
          return (
            <g key={slot.id}>
              {parent && (
                <line className="tree-edge is-slot" x1={x(parent.column)} y1={y(parent.depth)} x2={cx} y2={cy - 11} />
              )}
              <g
                className={`tree-slot ${slotState?.(slot) ?? ''}`}
                role="button"
                tabIndex={0}
                aria-label={name}
                onClick={() => onSlot?.(slot)}
                onKeyDown={activate(() => onSlot?.(slot))}
              >
                <rect x={cx - 12} y={cy - 11} width={24} height={22} rx={7} />
                <text x={cx} y={cy} dy="0.35em">
                  +
                </text>
              </g>
            </g>
          )
        })}

        {layout.nodes.map(({ key, column, depth }) => {
          const s = state?.(key) || ''
          const n = badge?.(key)
          const clickable = Boolean(onNode)
          return (
            <g
              key={key}
              className={`tree-node${s ? ` is-${s}` : ''}${clickable ? ' is-clickable' : ''}`}
              transform={`translate(${x(column)} ${y(depth)})`}
              {...(clickable && {
                role: 'button',
                tabIndex: 0,
                'aria-label': `Node ${key}`,
                onClick: () => onNode!(key),
                onKeyDown: activate(() => onNode!(key)),
              })}
            >
              <g className="tree-node-body">
                <circle r={r} />
                <text className="tree-key" dy="0.35em">
                  {key}
                </text>
              </g>
              {n != null && (
                <g className="tree-badge" transform={`translate(${r * 0.86} ${-r * 0.86})`}>
                  <circle r={9} />
                  <text dy="0.35em">{n}</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
