import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { fromKeys, insert, insertSlot, levelCount, searchPath } from './bst'
import {
  CODE_NOTES,
  frontierTrace,
  insertTrace,
  CODE,
  searchTrace,
  traversalOrder,
  traversalTrace,
  type TraceKind,
  type TraceStep,
  type TraversalKind,
} from './traces'
import { depthFirstOrder, levels } from './traversal'

const uniqueKeys = fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 1, maxLength: 25 })
const kinds = fc.constantFrom<TraversalKind>('pre', 'in', 'post', 'level')
const lecture = fromKeys([15, 9, 23, 4, 12, 20, 27])
const ALL_KINDS: TraceKind[] = ['pre', 'in', 'post', 'level', 'bfs', 'dfs', 'search', 'insert']

/** Line 0 is the signature: a step must point at a line inside the body. */
const linesInBody = (steps: TraceStep[], lines: string[]) => steps.every((s) => s.line >= 1 && s.line < lines.length)

function traceOf(kind: TraceKind, keys: number[], key: number): TraceStep[] {
  const tree = fromKeys(keys)
  if (kind === 'search') return searchTrace(tree, key)
  if (kind === 'insert') return insertTrace(tree, key).steps
  if (kind === 'bfs' || kind === 'dfs') return frontierTrace(tree, kind)
  return traversalTrace(tree, kind)
}

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
          steps.slice(0, -1).every((s) => !s.done)
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
    expect(level.some((s) => s.text === '1 has no children: it is a leaf, so nothing joins the queue.')).toBe(true)
    expect(traversalTrace(fromKeys([2, 3]), 'level').some((s) => s.text === '2 has no left child.')).toBe(true)
    const pre = traversalTrace(fromKeys([2, 1]), 'pre')
    expect(pre.some((s) => s.text === '1 has no left child (null), so there is nothing to do.')).toBe(true)
    expect(pre.some((s) => s.text === 'preorder(1) returns to 2.')).toBe(true)
  })

  it('say there is nothing to visit in an empty tree', () => {
    expect(traversalTrace(null, 'in')).toEqual([expect.objectContaining({ done: true, output: [] })])
  })
})

describe('frontierTrace', () => {
  const sample = fromKeys([50, 30, 70, 20, 40, 60, 80, 45, 65])

  it('starts with only the root waiting', () => {
    expect(frontierTrace(sample, 'bfs')[0]).toMatchObject({ queue: [50], output: [] })
  })

  it('lists waiting nodes next one out first, whichever frontier is used', () => {
    const after = (kind: 'bfs' | 'dfs') => frontierTrace(sample, kind).find((s) => s.current === 30 && s.line === 5)!
    expect(after('bfs').queue).toEqual([70, 20, 40])
    expect(after('dfs').queue).toEqual([20, 40, 70])
  })

  it('visits every node exactly once and ends with nothing waiting', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.constantFrom<'bfs' | 'dfs'>('bfs', 'dfs'), (keys, kind) => {
        const last = frontierTrace(fromKeys(keys), kind).at(-1)!
        return last.done === true && new Set(last.output).size === keys.length && last.queue.length === 0
      }),
    )
  })

  it('walks breadth first like level-order and depth first like pre-order', () => {
    fc.assert(
      fc.property(uniqueKeys, (keys) => {
        const tree = fromKeys(keys)
        expect(frontierTrace(tree, 'bfs').at(-1)!.output).toEqual(traversalOrder(tree, 'level'))
        expect(frontierTrace(tree, 'dfs').at(-1)!.output).toEqual(traversalOrder(tree, 'pre'))
      }),
    )
  })

  it('lists waiting nodes next one out first and says how each frontier adds children', () => {
    const stack = frontierTrace(fromKeys([2, 1, 3]), 'dfs')
    expect(stack[0].text).toBe('Start: add the root (2) to the stack.')
    expect(stack[3].text).toBe("Push 2's children, right 3 first, then left 1, so 1 is on top. Stack: 1, 3.")
    const queue = frontierTrace(fromKeys([2, 1, 3]), 'bfs')
    expect(queue[3].text).toBe("Add 2's children to the back of the queue, left 1 then right 3. Queue: 1, 3.")
    expect(frontierTrace(fromKeys([2, 1]), 'bfs')[3].text).toBe("Add 2's only child, 1, to the queue. Queue: 1.")
    expect(frontierTrace(fromKeys([2, 1]), 'dfs')[3].why).toBe('1 goes on top of the stack, so it comes out next.')
    expect(queue.some((s) => s.text === '1 is a leaf, so no children are added. Queue: 3.')).toBe(true)
  })

  it('says there is nothing to visit in an empty tree', () => {
    expect(frontierTrace(null, 'dfs')).toEqual([expect.objectContaining({ done: true, output: [] })])
  })
})

describe('searchTrace', () => {
  it('follows the same path as searchPath, hit or miss', () => {
    fc.assert(
      fc.property(uniqueKeys, fc.integer({ min: 1, max: 120 }), (keys, key) => {
        const tree = fromKeys(keys)
        const last = searchTrace(tree, key).at(-1)!
        const expected = searchPath(tree, key)
        return last.done === true && last.found === expected.found && last.path.join() === expected.compared.join()
      }),
    )
  })

  it('checks null, then equality, then direction, at every node', () => {
    const steps = searchTrace(fromKeys([50, 30, 70, 20, 40, 60, 80]), 45)
    expect(steps.map((s) => s.line)).toEqual([1, 2, 3, 1, 2, 4, 1, 2, 4, 1])
    expect(steps.filter((s) => !s.detail).map((s) => s.text)).toEqual([
      '45 < 50, so the key can only be in the LEFT subtree.',
      '45 > 30, so the key can only be in the RIGHT subtree.',
      '45 > 40, so the key can only be in the RIGHT subtree.',
      'We reached a null link: 45 is not found (3 comparisons).',
    ])
  })

  it('reports comparisons in words', () => {
    expect(searchTrace(lecture, 15).at(-1)!.text).toBe('15 == 15: found after 1 comparison.')
    expect(searchTrace(lecture, 15).at(-1)!.why).toBe('15 is at the root, so one comparison is enough.')
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
          steps.at(-1)!.inserted === key
        )
      }),
    )
  })

  it('makes the first key the root of an empty tree', () => {
    const { steps, result } = insertTrace(null, 8)
    expect(result).toEqual(fromKeys([8]))
    expect(steps.map((s) => s.text)).toEqual([
      'The tree is empty, so 8 becomes the root.',
      'Inserted 8. The tree now has one node.',
    ])
  })

  it('leaves the tree alone for a key it already holds, at the line that does nothing', () => {
    const { steps, result } = insertTrace(lecture, 12)
    const last = steps.at(-1)!
    expect(result).toBe(lecture)
    expect(last.done).toBe(true)
    expect(last.inserted).toBeUndefined()
    expect(CODE.insert[last.line]).toBe('  return node;')
  })
})

describe('every trace', () => {
  const anyTrace = fc.tuple(uniqueKeys, fc.constantFrom(...ALL_KINDS), fc.integer({ min: 1, max: 120 }))
  const anyTraceOrEmpty = fc.tuple(
    fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { maxLength: 25 }),
    fc.constantFrom(...ALL_KINDS),
    fc.integer({ min: 1, max: 120 }),
  )

  it('has a note for every line of its code', () => {
    for (const kind of ALL_KINDS) expect(CODE_NOTES[kind], kind).toHaveLength(CODE[kind].length)
  })

  it('points every step at a line in the body, never the signature', () => {
    fc.assert(fc.property(anyTraceOrEmpty, ([keys, kind, key]) => linesInBody(traceOf(kind, keys, key), CODE[kind])))
  })

  it('marks as detail only steps that change nothing in the output, stack or queue', () => {
    fc.assert(
      fc.property(anyTrace, ([keys, kind, key]) => {
        const steps = traceOf(kind, keys, key)
        const start = { output: [], stack: [], queue: [] }
        return steps.every((s, i) => {
          const before = steps[i - 1] ?? start
          return (
            !s.detail ||
            (s.output.join() === before.output.join() &&
              s.stack.join() === before.stack.join() &&
              s.queue.join() === before.queue.join())
          )
        })
      }),
    )
  })

  it('still ends on the finished state when detail steps are left out', () => {
    fc.assert(
      fc.property(anyTraceOrEmpty, ([keys, kind, key]) => {
        const steps = traceOf(kind, keys, key)
        const coarse = steps.filter((s) => !s.detail)
        return coarse.at(-1) === steps.at(-1) && steps.at(-1)!.done === true
      }),
    )
  })

  it('gives a reason for every step that changes something, except the closing summary', () => {
    fc.assert(
      fc.property(anyTrace, ([keys, kind, key]) => {
        const steps = traceOf(kind, keys, key)
        return steps.slice(0, -1).every((s) => s.detail || Boolean(s.why))
      }),
    )
  })

  it('labels the current node on every step that has one', () => {
    fc.assert(
      fc.property(anyTrace, ([keys, kind, key]) =>
        traceOf(kind, keys, key).every((s) => s.current === null || s.done || Boolean(s.note)),
      ),
    )
  })
})
