import { describe, expect, it } from 'vitest'
import { findNode, isBst, predecessorOf, searchPath } from '../engine/bst'
import { seeded } from '../engine/random'
import { depthFirstOrder } from '../engine/traversal'
import { FIRST_STRIKE_MS, planWindow, SHOW_MS, strike, VARIANTS, WINDOW_MS } from './lightning'

describe('planWindow', () => {
  it('shows every variant once, inside the window, without overlapping', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const shows = planWindow(seeded(seed))
      expect(shows.map((s) => s.variant).sort()).toEqual([...VARIANTS].sort())
      expect(shows[0].at).toBeGreaterThanOrEqual(0)
      expect(shows.at(-1)!.at + SHOW_MS).toBeLessThanOrEqual(WINDOW_MS)
      shows.slice(1).forEach((s, i) => expect(s.at - shows[i].at).toBeGreaterThan(SHOW_MS))
    }
  })

  it('brings the first strike of the first window early, keeping every other rule', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const shows = planWindow(seeded(seed), true)
      expect(shows[0].at).toBeGreaterThanOrEqual(FIRST_STRIKE_MS.min)
      expect(shows[0].at).toBeLessThan(FIRST_STRIKE_MS.max)
      expect(shows.map((s) => s.variant).sort()).toEqual([...VARIANTS].sort())
      expect(shows.at(-1)!.at + SHOW_MS).toBeLessThanOrEqual(WINDOW_MS)
      shows.slice(1).forEach((s, i) => expect(s.at - shows[i].at).toBeGreaterThan(SHOW_MS))
    }
  })

  it('does not follow a fixed rotation: orders and times vary from window to window', () => {
    const windows = Array.from({ length: 60 }, (_, i) => planWindow(seeded(i + 1)))
    expect(new Set(windows.map((w) => w.map((s) => s.variant).join())).size).toBeGreaterThan(3)
    expect(new Set(windows.map((w) => w[0].at)).size).toBe(60)
  })
})

describe('strike', () => {
  it('inserts a new key where a search for it falls off the tree', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = strike('insert', seeded(seed))
      expect(findNode(s.before, s.key)).toBeNull()
      expect(findNode(s.after, s.key)).not.toBeNull()
      expect(s.path).toEqual(searchPath(s.before, s.key).compared)
      expect(isBst(s.after)).toBe(true)
    }
  })

  it('deletes a leaf after following the search path to it', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = strike('delete-leaf', seeded(seed))
      const n = findNode(s.before, s.key)!
      expect(n.left === null && n.right === null).toBe(true)
      expect(s.path.at(-1)).toBe(s.key)
      expect(findNode(s.after, s.key)).toBeNull()
    }
  })

  it('deletes a node with two children by copying in its immediate predecessor', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = strike('delete-by-copying', seeded(seed))
      const n = findNode(s.before, s.key)!
      expect(s.predecessor).toBe(predecessorOf(n))
      expect(s.path.at(-1)).toBe(s.predecessor)
      expect(depthFirstOrder(s.after, 'in')).not.toContain(s.key)
      expect(isBst(s.after)).toBe(true)
    }
  })
})
