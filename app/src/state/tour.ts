import { useSyncExternalStore } from 'react'

let active = false
const listeners = new Set<() => void>()

function set(value: boolean) {
  active = value
  for (const listener of listeners) listener()
}

/** Whether the tour is showing. Kept outside React so Home and the Help button can start it without sharing state. */
export const tours = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  isActive: () => active,
  start: () => set(true),
  finish: () => set(false),
}

export const useTourActive = () => useSyncExternalStore(tours.subscribe, tours.isActive)
