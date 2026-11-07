import { balancedFrom, fromKeys, height, type Tree } from './bst'
import { depthFirstOrder } from './traversal'

export type Rng = () => number

/** Small seeded generator, so tests and demos can replay the same trees. */
export function seeded(seed: number): Rng {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)]
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function distinctKeys(count: number, rng: Rng): number[] {
  const keys = new Set<number>()
  while (keys.size < count) keys.add(1 + Math.floor(rng() * 99))
  return [...keys]
}

/**
 * A random BST with keys 1 to 99 whose height, in levels, stays within
 * maxHeight, so it fits on a phone screen. Falls back to a balanced tree if chance keeps
 * producing tall ones.
 */
export function randomTree(count: number, rng: Rng, maxHeight = 4): Tree {
  for (let attempt = 0; attempt < 200; attempt++) {
    const tree = fromKeys(distinctKeys(count, rng))
    if (height(tree) <= maxHeight) return tree
  }
  return balancedFrom(distinctKeys(count, rng).sort((a, b) => a - b))
}

/** A key from 1 to 99 that is not in the tree yet. */
export function freshKey(root: Tree, rng: Rng): number {
  const taken = new Set(depthFirstOrder(root, 'in'))
  for (;;) {
    const key = 1 + Math.floor(rng() * 99)
    if (!taken.has(key)) return key
  }
}
