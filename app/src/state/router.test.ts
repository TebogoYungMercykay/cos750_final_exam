import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { REVIEW } from '../content/playground'
import { OUTCOME_IDS } from '../content/modules'
import { go, href, parseRoute, useRoute, type Route } from './router'

afterEach(() => {
  window.location.hash = ''
})

describe('routes', () => {
  const routes: Route[] = [
    { name: 'home' },
    { name: 'warmup' },
    { name: 'lesson', id: 'm3' },
    { name: 'playground' },
    { name: 'playground', op: 'frontier' },
    { name: 'playground', op: 'search', preset: 'sorted', key: 60 },
    { name: 'practice' },
    { name: 'practice', topic: 'LO4' },
    { name: 'check' },
    { name: 'progress' },
  ]

  it.each(routes.map((r) => [href(r), r]))('%s parses back to the same route', (link, route) => {
    expect(parseRoute(link)).toEqual(route)
  })

  it('fills in the default tree when a link names a key but no tree', () => {
    expect(href({ name: 'playground', op: 'insert', key: 7 })).toBe('#/playground/insert/lecture/7')
  })

  it('ignores playground parts it does not recognise', () => {
    expect(parseRoute('#/playground/fly')).toEqual({ name: 'playground' })
    expect(parseRoute('#/playground/pre/forest')).toEqual({ name: 'playground', op: 'pre' })
  })

  it('accepts only a plain whole number from 0 to 999 as a key', () => {
    const keyOf = (part: string) => (parseRoute(`#/playground/search/sorted/${part}`) as { key?: number }).key
    expect(keyOf('60')).toBe(60)
    expect(keyOf('0')).toBe(0)
    for (const bad of ['', '1e2', '0x1F', '12.5', '-3', '1000']) expect(keyOf(bad), JSON.stringify(bad)).toBeUndefined()
  })

  it('links every outcome to a playground animation that opens running', () => {
    for (const lo of OUTCOME_IDS) {
      const route = parseRoute(href({ name: 'playground', ...REVIEW[lo] }))
      expect(route, lo).toMatchObject({ name: 'playground', op: REVIEW[lo].op, preset: REVIEW[lo].preset })
    }
  })

  it('follows the hash as it changes', () => {
    const { result } = renderHook(() => useRoute())
    expect(result.current).toEqual({ name: 'home' })
    act(() => {
      go({ name: 'lesson', id: 'm2' })
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current).toEqual({ name: 'lesson', id: 'm2' })
  })
})
