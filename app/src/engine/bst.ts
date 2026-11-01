export interface TreeNode {
  key: number
  left: TreeNode | null
  right: TreeNode | null
}

export type Tree = TreeNode | null

export function node(key: number, left: Tree = null, right: Tree = null): TreeNode {
  return { key, left, right }
}

/**
 * Returns a new tree and leaves the input untouched, so every step of a
 * build can be kept for replay. A duplicate key returns the same tree object,
 * which lets callers detect that nothing changed.
 */
export function insert(root: Tree, key: number): TreeNode {
  if (root === null) return node(key)
  if (key < root.key) {
    const left = insert(root.left, key)
    return left === root.left ? root : node(root.key, left, root.right)
  }
  if (key > root.key) {
    const right = insert(root.right, key)
    return right === root.right ? root : node(root.key, root.left, right)
  }
  return root
}

export function fromKeys(keys: readonly number[]): Tree {
  return keys.reduce<Tree>((tree, key) => insert(tree, key), null)
}

export interface SearchPath {
  found: boolean
  compared: number[]
}

export function searchPath(root: Tree, key: number): SearchPath {
  const compared: number[] = []
  let current = root
  while (current !== null) {
    compared.push(current.key)
    if (key === current.key) return { found: true, compared }
    current = key < current.key ? current.left : current.right
  }
  return { found: false, compared }
}

/**
 * Checks the ordering property for every subtree, not only parent and child,
 * so the classic trap of a deep node on the wrong side of an ancestor fails.
 */
export function isBst(root: Tree, low = -Infinity, high = Infinity): boolean {
  if (root === null) return true
  if (root.key <= low || root.key >= high) return false
  return isBst(root.left, low, root.key) && isBst(root.right, root.key, high)
}

export function size(root: Tree): number {
  return root === null ? 0 : 1 + size(root.left) + size(root.right)
}

export function levelCount(root: Tree): number {
  return root === null ? 0 : 1 + Math.max(levelCount(root.left), levelCount(root.right))
}

/** Height in edges, so a single node has height 0 and the empty tree -1. */
export function height(root: Tree): number {
  return levelCount(root) - 1
}

/** A tree written as nested arrays: a key, or [key, left, right], or null. */
export type TreeSpec = number | null | [number, TreeSpec?, TreeSpec?]

/** Builds the exact shape given, valid BST or not, so broken trees can be drawn. */
export function fromSpec(spec: TreeSpec): Tree {
  if (spec === null) return null
  if (typeof spec === 'number') return node(spec)
  const [key, left = null, right = null] = spec
  return node(key, fromSpec(left), fromSpec(right))
}

/** Searches every node, not only the BST path, because question trees may break the rule. */
export function findNode(root: Tree, key: number): TreeNode | null {
  if (root === null) return null
  if (root.key === key) return root
  return findNode(root.left, key) ?? findNode(root.right, key)
}

export function parentOf(root: Tree, key: number): TreeNode | null {
  if (root === null) return null
  if (root.left?.key === key || root.right?.key === key) return root
  return parentOf(root.left, key) ?? parentOf(root.right, key)
}

export function depthOf(root: Tree, key: number, depth = 0): number {
  if (root === null) return -1
  if (root.key === key) return depth
  const left = depthOf(root.left, key, depth + 1)
  return left !== -1 ? left : depthOf(root.right, key, depth + 1)
}

export function leaves(root: Tree): number[] {
  if (root === null) return []
  if (root.left === null && root.right === null) return [root.key]
  return [...leaves(root.left), ...leaves(root.right)]
}

/**
 * The first node, in pre-order, that is on the wrong side of some ancestor,
 * or null for a valid BST. Mirrors isBst so the two can never disagree.
 */
export function firstViolation(root: Tree, low = -Infinity, high = Infinity): number | null {
  if (root === null) return null
  if (root.key <= low || root.key >= high) return root.key
  return firstViolation(root.left, low, root.key) ?? firstViolation(root.right, root.key, high)
}

export type Side = 'left' | 'right'

export interface Slot {
  parent: number | null
  side: Side | null
}

/** The empty child link a key would be inserted into. */
export function insertSlot(root: Tree, key: number): Slot {
  if (root === null) return { parent: null, side: null }
  let current = root
  for (;;) {
    const side: Side = key < current.key ? 'left' : 'right'
    const next = current[side]
    if (next === null) return { parent: current.key, side }
    current = next
  }
}

/** A height-balanced BST from keys that are already sorted. */
export function balancedFrom(sorted: readonly number[]): Tree {
  if (sorted.length === 0) return null
  const mid = Math.floor(sorted.length / 2)
  return node(sorted[mid], balancedFrom(sorted.slice(0, mid)), balancedFrom(sorted.slice(mid + 1)))
}
