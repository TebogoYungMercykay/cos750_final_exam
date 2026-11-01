import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { fromKeys, insert, insertSlot, levelCount, searchPath } from './bst'
import {
  insertTrace,
  PSEUDOCODE,
  searchTrace,
  traversalOrder,
  traversalTrace,
  type TraceStep,
  type TraversalKind,
} from './traces'
import { depthFirstOrder, levels } from './traversal'

const uniqueKeys = fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 1, maxLength: 25 })
const kinds = fc.constantFrom<TraversalKind>('pre', 'in', 'post', 'level')
const lecture = fromKeys([15, 9, 23, 4, 12, 20, 27])

const linesInRange = (steps: TraceStep[], lines: string[]) => steps.every((s) => s.line >= 0 && s.line < lines.length)

describe('traversal traces', () => {
  it('match the lecture example orders', () => {
    expect(traversalOrder(lecture, 'pre')).toEqual([15, 9, 4, 12, 23, 20, 27])
    expect(traversalOrder(lecture, 'in')).toEqual([4, 9, 12, 15, 20, 23, 27])
    expect(traversalOrder(lecture, 'post')).toEqual([4, 12, 9, 20, 27, 23, 15])
    expect(traversalOrder(lecture, 'level')).toEqual([15, 9, 23, 4, 12, 20, 27])
  })

  it('end with the full order, marked done, for any tree and kind', () => {
    fc.assert(
      fc.property(uniqueKeys, kinds, (keys, kind) => {
        const tree = fromKeys(keys)
        const steps = traversalTrace(tree, kind)
        const last = steps.at(-1)!
        return (
          last.done === true &&
          last.output.join() === traversalOrder(tree, kind).join() &&
          steps.slice(0, -1).every((s) => !s.done) &&
          linesInRange(steps, PSEUDOCODE[kind])
        )
      }),
    )
  })

  it('agree with the plain traversal functions', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        expect(traversalOrder(tree, 'level')).toEqual(levels(tree).flat())
        expect(traversalOrder(tree, 'post')).toEqual(depthFirstOrder(tree, 'post'))
      }),
    )
  })

  it('keep at most one call per level on the stack and empty it by the end', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.constantFrom<TraversalKind>('pre', 'in', 'post'), (keys, kind) => {
        const tree = fromKeys(keys)
        const steps = traversalTrace(tree, kind)
        return Math.max(...steps.map((s) => s.stack.length)) === levelCount(tree) && steps.at(-1)!.stack.length === 0
      }),
    )
  })

  it('narrate leaves and returns for level-order and depth first', () => {
    const level = traversalTrace(fromKeys([2, 1, 3]), 'level')
    expect(level[0].text).toBe('Start: put the root (2) in the queue.')
    expect(level.some((s) => s.text.startsWith('1 is a leaf'))).toBe(true)
    const pre = traversalTrace(fromKeys([2, 1]), 'pre')
    expect(pre.some((s) => s.text === '1 has no left child (null), so there is nothing to do.')).toBe(true)
    expect(pre.some((s) => s.text === 'preorder(1) returns to 2.')).toBe(true)
  })

  it('say there is nothing to visit in an empty tree', () => {
    expect(traversalTrace(null, 'in')).toEqual([expect.objectContaining({ done: true, output: [] })])
  })
})

describe('searchTrace', () => {
  it('follows the same path as searchPath, hit or miss', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.integer({ min: 1, max: 120 }), (keys, key) => {
        const tree = fromKeys(keys)
        const steps = searchTrace(tree, key)
        const last = steps.at(-1)!
        const expected = searchPath(tree, key)
        return (
          last.done === true &&
          last.found === expected.found &&
          last.path.join() === expected.compared.join() &&
          linesInRange(steps, PSEUDOCODE.search)
        )
      }),
    )
  })

  it('reports comparisons in words', () => {
    expect(searchTrace(lecture, 15).at(-1)!.text).toBe('15 == 15: found after 1 comparison.')
    expect(searchTrace(lecture, 20).at(-1)!.text).toBe('20 == 20: found after 3 comparisons.')
    expect(searchTrace(null, 5).at(-1)!.text).toBe('The tree is empty, so 5 is not found.')
  })
})

describe('insertTrace', () => {
  it('produces the same tree as insert and shows the ghost in the right slot', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.integer({ min: 100, max: 200 }), (keys, key) => {
        const tree = fromKeys(keys)
        const { steps, result } = insertTrace(tree, key)
        const ghost = steps.find((s) => s.ghost)!.ghost!
        const slot = insertSlot(tree, key)
        return (
          JSON.stringify(result) === JSON.stringify(insert(tree, key)) &&
          ghost.parent === slot.parent &&
          ghost.side === slot.side &&
          steps.at(-1)!.inserted === key &&
          linesInRange(steps, PSEUDOCODE.insert)
        )
      }),
    )
  })

  it('makes the first key the root of an empty tree', () => {
    const { steps, result } = insertTrace(null, 8)
    expect(result).toEqual(fromKeys([8]))
    expect(steps.map((s) => s.text)).toEqual(['The tree is empty, so 8 becomes the root.', 'Inserted 8.'])
  })

  it('leaves the tree alone for a key it already holds', () => {
    const { steps, result } = insertTrace(lecture, 12)
    expect(result).toBe(lecture)
    expect(steps.at(-1)!.done).toBe(true)
    expect(steps.at(-1)!.inserted).toBeUndefined()
  })
})
