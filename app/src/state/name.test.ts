import { describe, expect, it } from 'vitest'
import { cleanName, initialOf, MAX_NAME, toneOf } from './name'

describe('names', () => {
  it('accepts letters from any language, with single spaces or hyphens between parts', () => {
    for (const name of ['Thabo', 'Zoë', 'Nkosinathi', 'Mary-Jane', 'Le Roux', 'Ñandú'])
      expect(cleanName(name)).toBe(name)
    expect(cleanName('  Lebo  ')).toBe('Lebo')
  })

  it('rejects digits, symbols, doubled or trailing separators, and names that are too long', () => {
    for (const name of [
      '',
      '   ',
      'Th4bo',
      'Lebo!',
      'Mary--Jane',
      'Le  Roux',
      '-Lebo',
      'Lebo-',
      'x'.repeat(MAX_NAME + 1),
    ]) {
      expect(cleanName(name), JSON.stringify(name)).toBeNull()
    }
  })

  it('gives every name a capital initial and the same shade every time', () => {
    expect(initialOf('thabo')).toBe('T')
    expect(initialOf('ñandú')).toBe('Ñ')
    expect(initialOf('')).toBe('?')
    expect(toneOf('Thabo')).toBe(toneOf('Tumi'))
    expect(new Set(['Anna', 'Ben', 'Cara', 'Dumi'].map(toneOf)).size).toBe(4)
  })
})
