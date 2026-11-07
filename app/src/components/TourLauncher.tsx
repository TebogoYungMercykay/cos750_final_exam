import { useEffect } from 'react'
import type { TourId } from '../content/tours'
import { useProgress } from '../state/progress'
import { tours } from '../state/tour'

/** Makes a tour available to Help while mounted, and starts it the first time the learner gets here. */
export function TourLauncher({ id }: { id: TourId }) {
  const { progress } = useProgress()
  const seen = progress.toursSeen.includes(id)
  useEffect(() => {
    tours.register(id)
    if (!seen) tours.request(id)
    return () => tours.unregister(id)
  }, [id, seen])
  return null
}
