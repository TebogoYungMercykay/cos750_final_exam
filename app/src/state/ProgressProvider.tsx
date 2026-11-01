import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { BadgeId } from '../content/badges'
import { fresh, load, STORAGE_KEY, StoreContext, type Store } from './progress'
import { remember } from './scoring'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(load)
  const [toast, setToast] = useState<BadgeId | null>(null)
  const latest = useRef(progress)

  useEffect(() => {
    latest.current = progress
  }, [progress])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      /* progress then lasts for this visit only */
    }
  }, [progress])

  useEffect(() => {
    document.documentElement.dataset.theme = progress.theme
  }, [progress.theme])

  const dismissToast = useCallback(() => setToast(null), [])

  const award = useCallback((id: BadgeId) => {
    if (latest.current.badges.includes(id)) return
    setToast(id)
    setProgress((p) => (p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id], xp: p.xp + 25 }))
  }, [])

  const store = useMemo<Store>(
    () => ({
      progress,
      toast,
      award,
      dismissToast,
      update: (patch) => setProgress((p) => ({ ...p, ...patch })),
      record: (lo, score) =>
        setProgress((p) => ({
          ...p,
          xp: p.xp + Math.round(score * 10),
          results: lo === 'PRE' ? p.results : { ...p.results, [lo]: remember(p.results[lo], score) },
        })),
      completeModule: (id, score) =>
        setProgress((p) => {
          const before = p.modules[id] ?? { attempts: 0, best: 0 }
          return {
            ...p,
            xp: p.xp + 20,
            modules: { ...p.modules, [id]: { attempts: before.attempts + 1, best: Math.max(before.best, score) } },
          }
        }),
      saveReflection: (id, text) => setProgress((p) => ({ ...p, reflections: { ...p.reflections, [id]: text } })),
      addAssessment: (entry) => setProgress((p) => ({ ...p, assessments: [...p.assessments, entry] })),
      solvedPractice: () => setProgress((p) => ({ ...p, practiceSolved: p.practiceSolved + 1, xp: p.xp + 5 })),
      reset: () => setProgress((p) => ({ ...fresh(), theme: p.theme })),
    }),
    [progress, toast, award, dismissToast],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
