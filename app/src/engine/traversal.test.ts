import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { fromKeys } from './bst'
import { depthFirstOrder, makeFrontier } from './traversal'

const uniqueKeys = fc.uniqueArray(fc.integer({ min: -999, max: 999 }), { maxLength: 40 })

describe('frontiers', () => {
  const [left, right] = [fromKeys([1])!, fromKeys([3])!]

  it('a queue gives back the node that has waited longest, and adds children left first', () => {
    const queue = makeFrontier('queue')
    queue.addChildren([left, right])
    expect(queue.keys()).toEqual([1, 3])
    expect(queue.remove().key).toBe(1)
    expect(queue.isEmpty()).toBe(false)
  })

  it('a stack gives back the newest node, and pushes children right first so the left one is on top', () => {
    const stack = makeFrontier('stack')
    stack.addChildren([left, right])
    expect(stack.keys()).toEqual([1, 3])
    expect(stack.remove().key).toBe(1)
    expect(stack.remove().key).toBe(3)
    expect(stack.isEmpty()).toBe(true)
  })
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
  it('in-order lists the keys in ascending order', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        expect(depthFirstOrder(fromKeys(keys), 'in')).toEqual([...keys].sort((a, b) => a - b))
      }),
    )
  })
})
