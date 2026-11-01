import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { fromKeys } from './bst'
import { depthFirstOrder, levels, searchSteps } from './traversal'

const sample = fromKeys([50, 30, 70, 20, 40, 60, 80, 45, 65])
const uniqueKeys = fc.uniqueArray(fc.integer({ min: -999, max: 999 }), { maxLength: 40 })
const lastOrder = (steps: { order: number[] }[]) => steps.at(-1)!.order

describe('uninformed search with a queue (breadth first)', () => {
  const steps = searchSteps(sample, 'queue')

  it('starts with only the root waiting', () => {
    expect(steps[0]).toEqual({ visited: null, order: [], frontier: [50], found: false })
  })

  it('visits the tree level by level', () => {
    expect(lastOrder(steps)).toEqual([50, 30, 70, 20, 40, 60, 80, 45, 65])
  })

  it('lists the queue front first after each visit', () => {
    expect(steps[2]).toMatchObject({ visited: 30, frontier: [70, 20, 40] })
  })
})

describe('uninformed search with a stack (depth first)', () => {
  const steps = searchSteps(sample, 'stack')

  it('follows the leftmost branch to the bottom before backtracking', () => {
    expect(lastOrder(steps)).toEqual([50, 30, 20, 40, 45, 70, 60, 65, 80])
  })

  it('lists the stack top first after each visit', () => {
    expect(steps[2]).toMatchObject({ visited: 30, frontier: [20, 40, 70] })
  })
})

describe('searching for a target', () => {
  it('stops at the target and marks it found', () => {
    const steps = searchSteps(sample, 'queue', 60)
    expect(steps.at(-1)).toMatchObject({ visited: 60, found: true })
    expect(lastOrder(steps)).toEqual([50, 30, 70, 20, 40, 60])
  })

  it('visits every node when the target is absent', () => {
    const steps = searchSteps(sample, 'stack', 99)
    expect(steps.some((s) => s.found)).toBe(false)
    expect(lastOrder(steps)).toHaveLength(9)
  })
})

it('yields only the start state for an empty tree', () => {
  expect(searchSteps(null, 'queue')).toEqual([{ visited: null, order: [], frontier: [], found: false }])
})

describe('depthFirstOrder', () => {
  it('produces pre, in and post order', () => {
    const tree = fromKeys([2, 1, 3])
    expect(depthFirstOrder(tree, 'pre')).toEqual([2, 1, 3])
    expect(depthFirstOrder(tree, 'in')).toEqual([1, 2, 3])
    expect(depthFirstOrder(tree, 'post')).toEqual([1, 3, 2])
  })
})

describe('properties of any tree built by insert', () => {
  it('queue order equals reading the levels top to bottom, left to right', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        expect(lastOrder(searchSteps(tree, 'queue'))).toEqual(levels(tree).flat())
      }),
    )
  })

  it('stack order equals pre-order', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        expect(lastOrder(searchSteps(tree, 'stack'))).toEqual(depthFirstOrder(tree, 'pre'))
      }),
    )
  })

  it('both frontiers visit every node exactly once, one node per step', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.constantFrom('queue' as const, 'stack' as const), (keys, kind) => {
        const steps = searchSteps(fromKeys(keys), kind)
        const order = lastOrder(steps)
        return steps.length === keys.length + 1 && new Set(order).size === keys.length
      }),
    )
  })

  it('in-order lists the keys in ascending order', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        expect(depthFirstOrder(fromKeys(keys), 'in')).toEqual([...keys].sort((a, b) => a - b))
      }),
    )
  })
})
