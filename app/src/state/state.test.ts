import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Answer } from '../content/types'
import { fresh, load, STORAGE_KEY } from './progress'
import { href, parseRoute, type Route } from './router'
import { credit, mastery, MEMORY, percent, remember, summarise } from './scoring'

const answer = (lo: Answer['lo'], score: number, extra: Partial<Answer> = {}): Answer => ({
  id: `${lo}-${score}`,
  lo,
  score,
  mistakes: 0,
  hintsUsed: 0,
  revealed: false,
  ...extra,
})

describe('scoring', () => {
  it('gives less credit for each hint or mistake and none once revealed', () => {
    expect([0, 1, 2, 3, 7].map((n) => credit(n, false))).toEqual([1, 0.6, 0.3, 0.1, 0.1])
    expect(credit(0, true)).toBe(0)
  })

  it('averages per outcome, leaving warm-up answers out of the outcomes', () => {
    const summary = summarise([answer('LO1', 1), answer('LO1', 0.6), answer('LO2', 0.3), answer('PRE', 1)])
    expect(summary.perOutcome).toEqual({ LO1: 0.8, LO2: 0.3 })
    expect(summary.overall).toBeCloseTo(0.725)
    expect(summary.noHints).toBe(true)
  })

  it('notices any hint, mistake or reveal', () => {
    expect(summarise([answer('LO1', 1), answer('LO1', 0.6, { hintsUsed: 1 })]).noHints).toBe(false)
    expect(summarise([answer('LO1', 0, { revealed: true })]).noHints).toBe(false)
    expect(summarise([]).overall).toBe(0)
  })

  it('keeps only the most recent answers for mastery', () => {
    let scores: number[] | undefined
    for (let i = 0; i < MEMORY + 5; i++) scores = remember(scores, i < 5 ? 0 : 1)
    expect(scores).toHaveLength(MEMORY)
    expect(mastery({ LO3: scores }, 'LO3')).toBe(1)
    expect(mastery({}, 'LO3')).toBeNull()
    expect(percent(0.666)).toBe('67%')
  })
})

describe('routes', () => {
  const all: Route[] = [
    { name: 'home' },
    { name: 'warmup' },
    { name: 'lesson', id: 'm4' },
    { name: 'playground' },
    { name: 'practice' },
    { name: 'practice', topic: 'LO5' },
    { name: 'check' },
    { name: 'progress' },
  ]

  it.each(all.map((r) => [href(r), r]))('%s round trips', (hash, route) => {
    expect(parseRoute(hash)).toEqual(route)
  })

  it('sends anything unknown home, including inherited object keys', () => {
    expect(parseRoute('')).toEqual({ name: 'home' })
    expect(parseRoute('#/nowhere')).toEqual({ name: 'home' })
    expect(parseRoute('#/lesson/toString')).toEqual({ name: 'home' })
    expect(parseRoute('#/lesson')).toEqual({ name: 'home' })
    expect(parseRoute('#/practice/LO9')).toEqual({ name: 'practice' })
  })
})

describe('saved progress', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts fresh, in light mode, when nothing is saved', () => {
    expect(load()).toEqual(fresh())
    expect(fresh().theme).toBe('light')
  })

  it('fills fields an older save does not have', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Lebo', xp: 40 }))
    expect(load()).toEqual({ ...fresh(), name: 'Lebo', xp: 40 })
  })

  it('starts fresh when the save is unreadable or storage is blocked', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(load()).toEqual(fresh())
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(load()).toEqual(fresh())
  })
})
