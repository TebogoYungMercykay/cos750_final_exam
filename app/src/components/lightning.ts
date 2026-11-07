import { findNode, fromKeys, insert, leaves, predecessorOf, remove, searchPath, type Tree } from '../engine/bst'
import { pick, shuffle, type Rng } from '../engine/random'
import { depthFirstOrder } from '../engine/traversal'

export const VARIANTS = ['insert', 'delete-leaf', 'delete-by-copying'] as const
export type Variant = (typeof VARIANTS)[number]

/** Every variant shows once in each window, so all three appear within ten minutes. */
export const WINDOW_MS = 10 * 60 * 1000
/** How long one strike lasts on screen. */
export const SHOW_MS = 4800
/** The least quiet time between two strikes. */
const GAP_MS = 2000
/** When the first window's first strike may come, so a learner sees one soon after arriving. */
export const FIRST_STRIKE_MS = { min: 20_000, max: 60_000 }

export interface Show {
  /** Milliseconds after the window opens. */
  at: number
  variant: Variant
}

/**
 * One window's strikes: each variant once, in a random order, at random
 * times, so there is no fixed rotation to notice. Offsets are spread out so
 * strikes never overlap, and the last one ends inside the window. In the
 * first window the first strike comes early, within FIRST_STRIKE_MS.
 */
export function planWindow(rng: Rng, first = false): Show[] {
  const slot = SHOW_MS + GAP_MS
  const slack = WINDOW_MS - VARIANTS.length * slot
  let offsets = VARIANTS.map(() => Math.floor(rng() * slack)).sort((a, b) => a - b)
  if (first) {
    const { min, max } = FIRST_STRIKE_MS
    const early = min + Math.floor(rng() * (max - min))
    offsets = offsets.map((o, i) => (i === 0 ? early : Math.max(o, early)))
  }
  const order = shuffle(VARIANTS, rng)
  return offsets.map((offset, i) => ({ at: offset + i * slot, variant: order[i] }))
}

export interface Strike {
  variant: Variant
  before: Tree
  after: Tree
  /** The key inserted or deleted. */
  key: number
  /** The keys the bolt passes through, from the root to the node acted on, as a search would. */
  path: number[]
  /** For deletion by copying: the immediate predecessor, whose key moves up into the deleted node. */
  predecessor?: number
}

const BASE = [50, 30, 70, 20, 40, 60, 80, 35, 65]
const NEW_KEYS = [10, 25, 45, 55, 75, 85]

/** One strike of a variant on a small fixed tree, worked out by the engine so the picture is always a real BST step. */
export function strike(variant: Variant, rng: Rng): Strike {
  const before = fromKeys(BASE)
  if (variant === 'insert') {
    const key = pick(NEW_KEYS, rng)
    return { variant, before, after: insert(before, key), key, path: searchPath(before, key).compared }
  }
  if (variant === 'delete-leaf') {
    const key = pick(leaves(before), rng)
    return { variant, before, after: remove(before, key), key, path: searchPath(before, key).compared }
  }
  const full = depthFirstOrder(before, 'in').filter((k) => {
    const n = findNode(before, k)!
    return n.left !== null && n.right !== null
  })
  const key = pick(full, rng)
  const target = findNode(before, key)!
  const predecessor = predecessorOf(target)
  return {
    variant,
    before,
    after: remove(before, key),
    key,
    predecessor,
    path: [...searchPath(before, key).compared, ...searchPath(target.left, predecessor).compared],
  }
}
