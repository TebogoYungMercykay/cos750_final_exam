import { useSyncExternalStore } from 'react'
import type { TourId } from '../content/tours'

export interface TourState {
  active: TourId | null
  /** Tours whose screen or component is mounted, in mount order, so Help can replay them. */
  available: TourId[]
}

let state: TourState = { active: null, available: [] }
let queue: TourId[] = []
const listeners = new Set<() => void>()

function set(patch: Partial<TourState>) {
  state = { ...state, ...patch }
  for (const listener of listeners) listener()
}

function advance() {
  const next = queue.shift()
  if (next) set({ active: next })
}

/**
 * Tours live outside React state, so a screen can ask for one from an effect
 * without a render cascade, and a page tour and a component tour on the same
 * screen run one after the other instead of on top of each other.
 */
export const tours = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  get: (): TourState => state,
  register(id: TourId) {
    if (!state.available.includes(id)) set({ available: [...state.available, id] })
  },
  unregister(id: TourId) {
    queue = queue.filter((q) => q !== id)
    set({ available: state.available.filter((a) => a !== id), active: state.active === id ? null : state.active })
    if (state.active === null) advance()
  },
  request(id: TourId) {
    if (state.active === id || queue.includes(id)) return
    queue.push(id)
    if (state.active === null) advance()
  },
  replay() {
    queue = [...state.available]
    set({ active: null })
    advance()
  },
  finish() {
    set({ active: null })
    advance()
  },
  /** Back to the empty state; for tests. */
  reset() {
    queue = []
    set({ active: null, available: [] })
  },
}

export const useTours = () => useSyncExternalStore(tours.subscribe, tours.get)
