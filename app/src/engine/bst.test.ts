import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  childCount,
  firstViolation,
  fromKeys,
  fromSpec,
  height,
  insert,
  isBst,
  leaves,
  node,
  nullLinks,
  searchPath,
  size,
  violatedAncestor,
} from './bst'

const uniqueKeys = fc.uniqueArray(fc.integer({ min: -999, max: 999 }), { maxLength: 40 })

describe('insert', () => {
  it('places smaller keys left and larger keys right', () => {
    expect(fromKeys([50, 30, 70])).toEqual(node(50, node(30), node(70)))
  })

  it('leaves the original tree unchanged', () => {
    const before = fromKeys([50, 30])
    const snapshot = structuredClone(before)
    insert(before, 40)
    expect(before).toEqual(snapshot)
  })

  it('returns the same tree for a duplicate key on either side', () => {
    const tree = fromKeys([50, 30, 70])
    expect(insert(tree, 30)).toBe(tree)
    expect(insert(tree, 70)).toBe(tree)
  })
})

describe('searchPath', () => {
  const tree = fromKeys([50, 30, 70, 20, 40])

  it('lists every key compared on the way to a hit', () => {
    expect(searchPath(tree, 40)).toEqual({ found: true, compared: [50, 30, 40] })
  })

  it('reports a miss after falling off a leaf', () => {
    expect(searchPath(tree, 45)).toEqual({ found: false, compared: [50, 30, 40] })
  })

  it('reports a miss on an empty tree without comparing', () => {
    expect(searchPath(null, 1)).toEqual({ found: false, compared: [] })
  })
})

describe('isBst', () => {
  it('accepts the empty tree', () => {
    expect(isBst(null)).toBe(true)
  })

  it('rejects a key that is valid for its parent but not for an ancestor', () => {
    expect(isBst(node(50, node(30, null, node(60))))).toBe(false)
  })

  it('rejects a duplicate key', () => {
    expect(isBst(node(50, node(50)))).toBe(false)
  })
})

describe('height', () => {
  it('grows by one per key when keys arrive sorted', () => {
    expect(height(fromKeys([1, 2, 3, 4, 5]))).toBe(5)
  })

  it('stays small when keys arrive in a balancing order', () => {
    expect(height(fromKeys([4, 2, 6, 1, 3, 5, 7]))).toBe(3)
  })
})

describe('violatedAncestor', () => {
  it('names the parent when the node is on the wrong side of its parent', () => {
    expect(violatedAncestor(fromSpec([50, 51, null]), 51)).toEqual({ ancestor: 50, parent: 50 })
  })

  it('names an ancestor further up when the parent is fine', () => {
    expect(violatedAncestor(fromSpec([25, [15, 10, 30], 40]), 30)).toEqual({ ancestor: 25, parent: 15 })
  })

  it('finds nothing for a correctly placed node, the root, or a key that is not there', () => {
    const tree = fromKeys([50, 30, 70])
    expect(violatedAncestor(tree, 30)).toBeNull()
    expect(violatedAncestor(tree, 50)).toBeNull()
    expect(violatedAncestor(tree, 99)).toBeNull()
  })

  it('finds nothing anywhere in a tree built by insert', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        return keys.every((k) => violatedAncestor(tree, k) === null) && firstViolation(tree) === null
      }),
    )
  })
})

describe('nullLinks', () => {
  it('names every empty child link, left to right as drawn', () => {
    expect(nullLinks(fromKeys([8, 3, 10, 6]))).toEqual(['3.left', '6.left', '6.right', '10.left', '10.right'])
    expect(nullLinks(null)).toEqual([])
  })

  it('finds one more null link than there are nodes', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => nullLinks(fromKeys(keys)).length === (keys.length ? keys.length + 1 : 0)),
    )
  })
})

describe('childCount', () => {
  const tree = fromKeys([50, 30, 70, 20])

  it('counts two children, one child and none', () => {
    expect(childCount(tree!)).toBe(2)
    expect(childCount(tree!.left!)).toBe(1)
    expect(childCount(tree!.right!)).toBe(0)
  })
})

describe('properties of any tree built by insert', () => {
  it('satisfies the ordering property', () => {
    fc.assert(fc.property(uniqueKeys, (keys) => isBst(fromKeys(keys))))
  })

  it('holds every key exactly once', () => {
    fc.assert(fc.property(uniqueKeys, (keys) => size(fromKeys(keys)) === keys.length))
  })

  it('finds every inserted key within one comparison per level', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        return keys.every((key) => {
          const { found, compared } = searchPath(tree, key)
          return found && compared.length <= height(tree)
        })
      }),
    )
  })

  it('has one fewer edge than nodes, so the child counts add up to size - 1', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        const countEdges = (t: typeof tree): number =>
          t === null ? 0 : childCount(t) + countEdges(t.left) + countEdges(t.right)
        return countEdges(tree) === Math.max(0, size(tree) - 1)
      }),
    )
  })

  it('gives zero children to exactly the leaves', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        const zero: number[] = []
        const walk = (t: typeof tree) => {
          if (t === null) return
          walk(t.left)
          if (childCount(t) === 0) zero.push(t.key)
          walk(t.right)
        }
        walk(tree)
        return zero.join() === leaves(tree).join()
      }),
    )
  })

  it('never finds a key that was not inserted', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.integer({ min: 1000, max: 2000 }), (keys, missing) => {
        return !searchPath(fromKeys(keys), missing).found
      }),
    )
  })
})
