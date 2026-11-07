import { describe, expect, it } from 'vitest'
import { rngFor, seedFrom } from './rng'

describe('demo seed', () => {
  it('reads a whole number seed from the query string', () => {
    expect(seedFrom('?seed=42')).toBe(42)
    expect(seedFrom('?theme=dark&seed=7')).toBe(7)
  })

  it('replays the same numbers for the same seed, and uses Math.random without one', () => {
    const a = rngFor(42)
    const b = rngFor(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
    expect(rngFor(null)).toBe(Math.random)
  })

  it('ignores anything that is not a whole number', () => {
    expect(seedFrom('')).toBeNull()
    expect(seedFrom('?seed=')).toBeNull()
    expect(seedFrom('?seed=abc')).toBeNull()
    expect(seedFrom('?seed=-1')).toBeNull()
    expect(seedFrom('?seed=1.5')).toBeNull()
  })
})
