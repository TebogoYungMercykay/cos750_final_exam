import { useEffect, useState } from 'react'
import { MODULE_BY_ID, OUTCOME_IDS } from '../content/modules'
import type { ModuleId, OutcomeId } from '../content/types'

export type Route =
  | { name: 'home' }
  | { name: 'warmup' }
  | { name: 'lesson'; id: ModuleId }
  | { name: 'playground' }
  | { name: 'practice'; topic?: OutcomeId }
  | { name: 'check' }
  | { name: 'progress' }

const SIMPLE = ['warmup', 'playground', 'check', 'progress'] as const

export function parseRoute(hash: string): Route {
  const [name, id] = hash.replace(/^#\/?/, '').split('/')
  if (name === 'lesson' && Object.hasOwn(MODULE_BY_ID, id ?? '')) return { name: 'lesson', id: id as ModuleId }
  if (name === 'practice') {
    return (OUTCOME_IDS as string[]).includes(id) ? { name: 'practice', topic: id as OutcomeId } : { name: 'practice' }
  }
  if ((SIMPLE as readonly string[]).includes(name)) return { name } as Route
  return { name: 'home' }
}

export function href(route: Route): string {
  if (route.name === 'home') return '#/'
  if (route.name === 'lesson') return `#/lesson/${route.id}`
  if (route.name === 'practice' && route.topic) return `#/practice/${route.topic}`
  return `#/${route.name}`
}

export function go(route: Route) {
  window.location.hash = href(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
