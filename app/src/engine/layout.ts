import type { Side, Tree } from './bst'

export interface PlacedNode {
  key: number
  column: number
  depth: number
}

export interface PlacedSlot {
  id: string
  parent: number | null
  side: Side | null
  column: number
  depth: number
}

export interface Layout {
  nodes: PlacedNode[]
  edges: { from: number; to: number }[]
  slots: PlacedSlot[]
  columns: number
  depth: number
}

/**
 * Columns follow in-order position, so keys read left to right in sorted
 * order and nothing overlaps. With slots on, every empty child link also
 * takes a column, which leaves room to draw where an insert would land.
 */
export function layoutTree(root: Tree, withSlots = false): Layout {
  const nodes: PlacedNode[] = []
  const slots: PlacedSlot[] = []
  const edges: { from: number; to: number }[] = []
  let column = 0

  const walk = (n: Tree, depth: number, parent: number | null, side: Side | null) => {
    if (n === null) {
      if (withSlots) {
        slots.push({ id: parent === null ? 'root' : `${parent}-${side}`, parent, side, column: column++, depth })
      }
      return
    }
    walk(n.left, depth + 1, n.key, 'left')
    nodes.push({ key: n.key, column: column++, depth })
    walk(n.right, depth + 1, n.key, 'right')
    if (n.left) edges.push({ from: n.key, to: n.left.key })
    if (n.right) edges.push({ from: n.key, to: n.right.key })
  }

  walk(root, 0, null, null)
  const depth = Math.max(0, ...nodes.map((n) => n.depth), ...slots.map((s) => s.depth))
  return { nodes, edges, slots, columns: column, depth }
}
