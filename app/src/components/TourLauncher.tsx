import { useEffect } from 'react'
import { useProgress } from '../state/progress'
import { tours } from '../state/tour'

/** Starts the tour for a learner who has neither finished nor skipped it; after that only Help starts it. */
export function TourLauncher() {
  const { progress } = useProgress()
  useEffect(() => {
    if (!progress.tourDone) tours.start()
  }, [progress.tourDone])
  return null
}
