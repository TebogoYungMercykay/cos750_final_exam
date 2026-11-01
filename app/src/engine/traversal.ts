import type { Tree, TreeNode } from './bst'

export type FrontierKind = 'queue' | 'stack'

interface Frontier {
  addChildren(children: TreeNode[]): void
  remove(): TreeNode
  isEmpty(): boolean
  /** Next node to be removed comes first. */
  keys(): number[]
}

function queueFrontier(): Frontier {
  const items: TreeNode[] = []
  return {
    addChildren: (children) => items.push(...children),
    remove: () => items.shift()!,
    isEmpty: () => items.length === 0,
    keys: () => items.map((n) => n.key),
  }
}

/**
 * Children are pushed right to left so the left child sits on top. This keeps
 * the search loop identical for both frontiers while depth first still
 * explores the left subtree first, matching pre-order.
 */
function stackFrontier(): Frontier {
  const items: TreeNode[] = []
  return {
    addChildren: (children) => items.push(...[...children].reverse()),
    remove: () => items.pop()!,
    isEmpty: () => items.length === 0,
    keys: () => items.map((n) => n.key).reverse(),
  }
}

export interface SearchStep {
  visited: number | null
  order: number[]
  frontier: number[]
  found: boolean
}

/**
 * Uninformed tree search: one loop, and the frontier alone decides whether
 * the walk is breadth first (queue) or depth first (stack). The first step is
 * the start state, before any node is visited.
 */
export function* uninformedSearch(root: Tree, kind: FrontierKind, target?: number): Generator<SearchStep> {
  const frontier = kind === 'queue' ? queueFrontier() : stackFrontier()
  const order: number[] = []
  if (root !== null) frontier.addChildren([root])
  yield { visited: null, order: [], frontier: frontier.keys(), found: false }

  while (!frontier.isEmpty()) {
    const current = frontier.remove()
    order.push(current.key)
    const found = current.key === target
    if (!found) {
      frontier.addChildren([current.left, current.right].filter((c) => c !== null))
    }
    yield { visited: current.key, order: [...order], frontier: frontier.keys(), found }
    if (found) return
  }
}

export function searchSteps(root: Tree, kind: FrontierKind, target?: number): SearchStep[] {
  return Array.from(uninformedSearch(root, kind, target))
}

export type DepthFirstOrder = 'pre' | 'in' | 'post'

export function depthFirstOrder(root: Tree, order: DepthFirstOrder): number[] {
  if (root === null) return []
  const left = depthFirstOrder(root.left, order)
  const right = depthFirstOrder(root.right, order)
  if (order === 'pre') return [root.key, ...left, ...right]
  if (order === 'in') return [...left, root.key, ...right]
  return [...left, ...right, root.key]
}

export function levels(root: Tree): number[][] {
  const result: number[][] = []
  const walk = (n: Tree, depth: number) => {
    if (n === null) return
    ;(result[depth] ??= []).push(n.key)
    walk(n.left, depth + 1)
    walk(n.right, depth + 1)
  }
  walk(root, 0)
  return result
}
