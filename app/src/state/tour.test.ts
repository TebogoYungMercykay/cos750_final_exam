import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { tours, useTours } from './tour'

afterEach(() => tours.reset())

describe('tour store', () => {
  it('runs requested tours one at a time, in the order asked', () => {
    tours.request('home')
    tours.request('player')
    expect(tours.get().active).toBe('home')
    tours.finish()
    expect(tours.get().active).toBe('player')
    tours.finish()
    expect(tours.get().active).toBeNull()
  })

  it('ignores a second request for a tour that is running or waiting', () => {
    tours.request('home')
    tours.request('home')
    tours.request('player')
    tours.request('player')
    tours.finish()
    tours.finish()
    expect(tours.get().active).toBeNull()
  })

  it('drops a tour whose screen goes away and moves on to the next', () => {
    tours.register('home')
    tours.register('player')
    tours.request('home')
    tours.request('player')
    tours.unregister('home')
    expect(tours.get().active).toBe('player')
    expect(tours.get().available).toEqual(['player'])
  })

  it('leaves the running tour alone when a waiting one goes away', () => {
    tours.request('home')
    tours.request('player')
    tours.unregister('player')
    expect(tours.get().active).toBe('home')
    tours.finish()
    expect(tours.get().active).toBeNull()
  })

  it('re-renders components that read it', () => {
    const { result } = renderHook(() => useTours())
    expect(result.current.active).toBeNull()
    act(() => tours.request('question'))
    expect(result.current.active).toBe('question')
  })

  it('replays every tour on the screen, in mount order', () => {
    tours.register('lesson')
    tours.register('player')
    tours.register('lesson')
    tours.replay()
    expect(tours.get().active).toBe('lesson')
    tours.finish()
    expect(tours.get().active).toBe('player')
  })

  it('notifies subscribers until they unsubscribe', () => {
    let calls = 0
    const stop = tours.subscribe(() => calls++)
    tours.request('home')
    stop()
    tours.finish()
    expect(calls).toBe(1)
  })
})
