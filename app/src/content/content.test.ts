import { describe, expect, it } from 'vitest'
import { depthFirstOrder } from '../engine/traversal'
import { findNode, firstViolation, fromKeys, height, searchPath, type Tree } from '../engine/bst'
import { seeded } from '../engine/random'
import { traversalOrder, TRAVERSALS } from '../engine/traces'
import { BANK, GENERATORS, needsGuidance, questionFor, readinessSet, WARMUP } from './assessment'
import { BADGES } from './badges'
import { MODULES, OUTCOMES, OUTCOME_IDS } from './modules'
import type { Question } from './types'

const keysOf = (tree: Tree) => depthFirstOrder(tree, 'in')

/** Structural rules every question must meet, authored or generated. */
function expectValid(q: Question) {
  expect(q.prompt.trim(), q.id).not.toBe('')
  if (q.type === 'mcq') {
    expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
    expect(q.answer, q.id).toBeLessThan(q.options.length)
    expect(new Set(q.options).size, q.id).toBe(q.options.length)
    if (q.prompt === 'Is this a valid BST?')
      expect(q.answer, q.id).toBe(firstViolation(q.tree ?? null) === null ? 0 : 1)
  }
  if (q.type === 'node') {
    expect(q.answer.length, q.id).toBeGreaterThan(0)
    for (const key of q.answer) expect(findNode(q.tree, key), `${q.id} answer ${key}`).not.toBeNull()
  }
  if (q.type === 'slot') expect(keysOf(q.tree), q.id).not.toContain(q.value)
  if (q.type === 'order') expect(q.tree, q.id).not.toBeNull()
  if ('violation' in q && q.violation !== undefined) expect(firstViolation(q.tree ?? null), q.id).toBe(q.violation)
}

const fixed: Question[] = [
  ...MODULES.flatMap((m) => [...m.quiz, ...m.sections.flatMap((s) => (s.type === 'try' ? [s.question] : []))]),
  ...BANK,
  ...WARMUP,
]

describe('authored content', () => {
  it.each(fixed.map((q) => [q.id, q]))('%s is well formed', (_, q) => expectValid(q))

  it('uses each question id once', () => {
    const ids = fixed.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('writes out traversal orders in explanations that match the engine', () => {
    for (const q of fixed.filter((x) => x.type === 'order')) {
      const label = TRAVERSALS[q.kind].label
      const stated = q.explain.match(new RegExp(`${label}(?: of a BST is sorted)?: ([\\d, ]+)`))
      expect(stated, q.id).not.toBeNull()
      expect(stated![1].split(', ').map(Number), q.id).toEqual(traversalOrder(q.tree, q.kind))
    }
  })

  it('states heights and comparison counts that match the engine', () => {
    const m1 = MODULES[0]
    const heightQ = m1.quiz.find((q) => q.id === 'm1q4')!
    expect(heightQ.type === 'mcq' && Number(heightQ.options[heightQ.answer])).toBe(height(heightQ.tree ?? null))
    const deepest = m1.sections.find((s) => s.type === 'try')!
    expect(deepest.type === 'try' && deepest.question.type === 'node' && height(deepest.question.tree)).toBe(3)
    const compare = MODULES[2].quiz.find((q) => q.id === 'm3q2')!
    expect(compare.type === 'mcq' && Number(compare.options[compare.answer])).toBe(
      searchPath(compare.tree ?? null, 40).compared.length,
    )
    const lastExamined = MODULES[2].quiz.find((q) => q.id === 'm3q3')!
    expect(lastExamined.type === 'node' && lastExamined.answer).toEqual([
      searchPath(lastExamined.tree ?? null, 65).compared.at(-1),
    ])
    const chain = MODULES[5].sections.find((s) => s.type === 'try')!
    const chainQ = chain.type === 'try' ? chain.question : null
    expect(chainQ?.type === 'mcq' && Number(chainQ.options[chainQ.answer])).toBe(
      searchPath(chainQ?.tree ?? null, 7).compared.length,
    )
    expect(searchPath(fromKeys([4, 2, 6, 1, 3, 5, 7]), 7).compared).toHaveLength(3)
  })
})

describe('constructive alignment', () => {
  it.each(OUTCOME_IDS)('%s has one lesson, a checkpoint of at least four items, and bank items', (lo) => {
    const lessons = MODULES.filter((m) => m.lo === lo)
    expect(lessons).toHaveLength(1)
    expect(OUTCOMES[lo].module).toBe(lessons[0].id)
    expect(lessons[0].quiz.length).toBeGreaterThanOrEqual(4)
    expect(lessons[0].quiz.every((q) => q.lo === lo)).toBe(true)
    expect(BANK.some((q) => q.lo === lo)).toBe(true)
  })

  it.each(MODULES.map((m) => [m.id, m]))('lesson %s has a guided try, a reflection, takeaways and a badge', (id, m) => {
    expect(m.sections.some((s) => s.type === 'try' && s.question.lo === m.lo)).toBe(true)
    expect(m.sections.some((s) => s.type === 'reflect')).toBe(true)
    expect(m.summary.length).toBeGreaterThan(0)
    expect(BADGES).toHaveProperty(id)
  })
})

describe('warm-up', () => {
  it('turns on guided mode for weak results or no prior exposure', () => {
    expect(needsGuidance(2, 2)).toBe(true)
    expect(needsGuidance(4, 0)).toBe(true)
    expect(needsGuidance(3, 1)).toBe(false)
  })
})

describe('generated questions', () => {
  it.each(Object.keys(GENERATORS))('%s produces valid questions with correct answers across many seeds', (lo) => {
    const generate = GENERATORS[lo as keyof typeof GENERATORS]
    for (let seed = 1; seed <= 150; seed++) {
      const q = generate(seeded(seed))
      expect(q.lo).toBe(lo)
      expectValid(q)
      if (q.type === 'mcq' && q.prompt.startsWith('What is the height')) {
        expect(Number(q.options[q.answer])).toBe(height(q.tree ?? null))
      }
      if (q.type === 'mcq' && q.prompt.startsWith('How many nodes')) {
        const key = Number(q.prompt.match(/searching for (\d+)/)![1])
        expect(Number(q.options[q.answer])).toBe(searchPath(q.tree ?? null, key).compared.length)
      }
    }
  })

  it('produces both valid and broken trees for the BST rule', () => {
    const answers = new Set(
      Array.from({ length: 40 }, (_, seed) => (GENERATORS.LO2(seeded(seed + 1)) as { answer: number }).answer),
    )
    expect(answers).toEqual(new Set([0, 1]))
  })

  it('draws LO6 from the bank with a fresh id each time', () => {
    const a = questionFor('LO6', seeded(1))
    const b = questionFor('LO6', seeded(1))
    expect(a.lo).toBe('LO6')
    expect(a.id).not.toBe(b.id)
    expect(questionFor('LO3', seeded(2)).lo).toBe('LO3')
  })

  it('builds a readiness check of two questions per outcome', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const set = readinessSet(seeded(seed))
      expect(set).toHaveLength(12)
      for (const lo of OUTCOME_IDS) expect(set.filter((q) => q.lo === lo)).toHaveLength(2)
      set.forEach(expectValid)
    }
  })
})
