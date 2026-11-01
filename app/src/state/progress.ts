import { createContext, useContext } from 'react'
import type { BadgeId } from '../content/badges'
import type { ModuleId, OutcomeId } from '../content/types'

export type Mode = 'standard' | 'guided'
export type Theme = 'light' | 'dark'

export interface Progress {
  name: string
  mode: Mode
  theme: Theme
  warmup: { score: number; of: number; confidence: number } | null
  modules: Partial<Record<ModuleId, { attempts: number; best: number }>>
  results: Partial<Record<OutcomeId, number[]>>
  xp: number
  badges: BadgeId[]
  practiceSolved: number
  assessments: { at: number; overall: number; perOutcome: Partial<Record<OutcomeId, number>> }[]
  reflections: Record<string, string>
}

export const STORAGE_KEY = 'treetutor-progress-v2'

export const fresh = (): Progress => ({
  name: '',
  mode: 'standard',
  theme: 'light',
  warmup: null,
  modules: {},
  results: {},
  xp: 0,
  badges: [],
  practiceSolved: 0,
  assessments: [],
  reflections: {},
})

/** Storage can be missing or blocked (private windows, previews), so every access is guarded. */
export function load(): Progress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...fresh(), ...JSON.parse(saved) } : fresh()
  } catch {
    return fresh()
  }
}

export interface Store {
  progress: Progress
  update: (patch: Partial<Progress>) => void
  record: (lo: OutcomeId | 'PRE', score: number) => void
  completeModule: (id: ModuleId, score: number) => void
  saveReflection: (id: string, text: string) => void
  addAssessment: (entry: Progress['assessments'][number]) => void
  solvedPractice: () => void
  award: (id: BadgeId) => void
  reset: () => void
  toast: BadgeId | null
  dismissToast: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useProgress(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useProgress needs a ProgressProvider above it')
  return store
}
