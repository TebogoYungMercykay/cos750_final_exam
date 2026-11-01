import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  balancedFrom,
  depthOf,
  findNode,
  firstViolation,
  fromKeys,
  fromSpec,
  height,
  insert,
  insertSlot,
  isBst,
  leaves,
  levelCount,
  node,
  parentOf,
  size,
} from './bst'
import { layoutTree } from './layout'
import { freshKey, pick, randomTree, seeded, shuffle } from './random'
import { depthFirstOrder } from './traversal'

const uniqueKeys = fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { maxLength: 30 })
const sample = fromKeys([40, 20, 60, 10, 30, 50, 70, 25])

describe('tree queries', () => {
  it('builds the exact shape a spec describes, valid BST or not', () => {
    expect(fromSpec([50, [30, 20, 60], 70])).toEqual(node(50, node(30, node(20), node(60)), node(70)))
    expect(fromSpec(null)).toBeNull()
  })

  it('finds parents, depths and leaves', () => {
    expect(findNode(sample, 25)?.key).toBe(25)
    expect(findNode(sample, 99)).toBeNull()
    expect(parentOf(sample, 25)?.key).toBe(30)
    expect(parentOf(sample, 40)).toBeNull()
    expect(depthOf(sample, 25)).toBe(3)
    expect(depthOf(sample, 70)).toBe(2)
    expect(depthOf(sample, 99)).toBe(-1)
    expect(leaves(sample)).toEqual([10, 25, 50, 70])
    expect(leaves(null)).toEqual([])
  })

  it('measures height in edges', () => {
    expect(height(null)).toBe(-1)
    expect(height(node(1))).toBe(0)
    expect(height(sample)).toBe(3)
  })

  it('points at the node that breaks the rule for an ancestor, not only a parent', () => {
    expect(firstViolation(fromSpec([50, [30, 20, 60], 70]))).toBe(60)
    expect(firstViolation(fromSpec([40, [20, 10, 30], [60, 45, [70, 35, null]]]))).toBe(35)
    expect(firstViolation(sample)).toBeNull()
  })

  it('names the empty link an insert lands in', () => {
    expect(insertSlot(null, 5)).toEqual({ parent: null, side: null })
    expect(insertSlot(fromKeys([50, 30, 70, 20, 40]), 35)).toEqual({ parent: 40, side: 'left' })
    expect(insertSlot(fromKeys([50, 30, 70]), 99)).toEqual({ parent: 70, side: 'right' })
  })

  it('agrees with isBst on arbitrary shapes', () => {
    const arbitrary: fc.Arbitrary<ReturnType<typeof node> | null> = fc.letrec<{ tree: ReturnType<typeof node> | null }>(
      (tie) => ({
        tree: fc.oneof(
          { depthSize: 'small' },
          fc.constant(null),
          fc.record({ key: fc.integer({ min: 0, max: 50 }), left: tie('tree'), right: tie('tree') }),
        ),
      }),
    ).tree
    fc.assert(fc.property(arbitrary, (tree) => (firstViolation(tree) === null) === isBst(tree)))
  })

  it('places an inserted key exactly in the slot insertSlot named', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.integer({ min: 100, max: 200 }), (keys, key) => {
        const tree = fromKeys(keys)
        const { parent, side } = insertSlot(tree, key)
        const after = insert(tree, key)
        return parent === null ? after.key === key : findNode(after, parent)![side!]?.key === key
      }),
    )
  })

  it('builds a minimum height tree from sorted keys', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const sorted = [...keys].sort((a, b) => a - b)
        const tree = balancedFrom(sorted)
        return isBst(tree) && size(tree) === keys.length && levelCount(tree) === Math.ceil(Math.log2(keys.length + 1))
      }),
    )
  })
})

describe('seeded randomness', () => {
  it('replays the same sequence for the same seed and stays in [0, 1)', () => {
    const a = seeded(42)
    const b = seeded(42)
    const draws = Array.from({ length: 50 }, () => a())
    expect(draws).toEqual(Array.from({ length: 50 }, () => b()))
    expect(draws.every((x) => x >= 0 && x < 1)).toBe(true)
  })

  it('picks members and shuffles without losing any', () => {
    const rng = seeded(7)
    const items = [1, 2, 3, 4, 5]
    expect(items).toContain(pick(items, rng))
    expect(shuffle(items, rng).sort()).toEqual(items)
  })

  it('makes BSTs of the asked size that fit the height limit', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const tree = randomTree(7, seeded(seed))
      expect(isBst(tree)).toBe(true)
      expect(size(tree)).toBe(7)
      expect(height(tree)).toBeLessThanOrEqual(3)
    }
  })

  it('falls back to a balanced tree when the limit cannot be met by chance', () => {
    const tree = randomTree(7, seeded(3), 1)
    expect(size(tree)).toBe(7)
    expect(height(tree)).toBe(2)
  })

  it('offers keys that are not in the tree yet', () => {
    const tree = randomTree(7, seeded(9))
    const rng = seeded(11)
    for (let i = 0; i < 50; i++) expect(depthFirstOrder(tree, 'in')).not.toContain(freshKey(tree, rng))
  })
})

describe('layoutTree', () => {
  it('gives every node its own column in sorted order', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const { nodes, edges, columns } = layoutTree(fromKeys(keys))
        const byColumn = [...nodes].sort((a, b) => a.column - b.column).map((n) => n.key)
        return (
          columns === keys.length &&
          edges.length === Math.max(0, keys.length - 1) &&
          byColumn.join() === [...keys].sort((a, b) => a - b).join()
        )
      }),
    )
  })

  it('adds one slot per empty link when slots are on', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const { slots, columns } = layoutTree(fromKeys(keys), true)
        return slots.length === keys.length + 1 && columns === 2 * keys.length + 1
      }),
    )
  })

  it('offers the root slot for an empty tree', () => {
    expect(layoutTree(null, true).slots).toEqual([{ id: 'root', parent: null, side: null, column: 0, depth: 0 }])
    expect(layoutTree(null).depth).toBe(0)
  })
})
