import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { tours, useTourActive } from './tour'

afterEach(() => tours.finish())

describe('tour store', () => {
  it('starts and finishes the one tour', () => {
    expect(tours.isActive()).toBe(false)
    tours.start()
    expect(tours.isActive()).toBe(true)
    tours.finish()
    expect(tours.isActive()).toBe(false)
  })

  it('re-renders components that read it, until they unsubscribe', () => {
    const { result, unmount } = renderHook(() => useTourActive())
    act(() => tours.start())
    expect(result.current).toBe(true)
    unmount()
    let calls = 0
    const stop = tours.subscribe(() => calls++)
    tours.finish()
    stop()
    tours.start()
    expect(calls).toBe(1)
  })
})
