import type { Tree, TreeNode } from './bst'

export type FrontierKind = 'queue' | 'stack'

export interface Frontier {
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

/**
 * The waiting list of uninformed tree search. A queue makes the walk breadth
 * first, a stack depth first; the loop that uses it is `frontierTrace` in
 * traces.ts, so the order shown is the order these objects produce.
 */
export function makeFrontier(kind: FrontierKind): Frontier {
  return kind === 'queue' ? queueFrontier() : stackFrontier()
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
