import { useEffect, useState } from 'react'
import { MODULE_BY_ID, OUTCOME_IDS } from '../content/modules'
import { DEFAULT_PRESET, OPERATIONS, parseKey, PRESETS, type Operation, type PresetId } from '../content/playground'
import type { ModuleId, OutcomeId } from '../content/types'

export type Route =
  | { name: 'home' }
  | { name: 'warmup' }
  | { name: 'lesson'; id: ModuleId }
  | { name: 'playground'; op?: Operation; preset?: PresetId; key?: number }
  | { name: 'practice'; topic?: OutcomeId }
  | { name: 'check' }
  | { name: 'progress' }

const SIMPLE = ['warmup', 'check', 'progress'] as const
const isOperation = (id = ''): id is Operation => OPERATIONS.some((o) => o.id === id)
const isPreset = (id = ''): id is PresetId => PRESETS.some((p) => p.id === id)

function playground(op?: string, preset?: string, key?: string): Route {
  if (!isOperation(op)) return { name: 'playground' }
  const k = parseKey(key)
  return {
    name: 'playground',
    op,
    ...(isPreset(preset) && { preset }),
    ...(k !== null && { key: k }),
  }
}

export function parseRoute(hash: string): Route {
  const [name, id, ...rest] = hash.replace(/^#\/?/, '').split('/')
  if (name === 'lesson' && Object.hasOwn(MODULE_BY_ID, id ?? '')) return { name: 'lesson', id: id as ModuleId }
  if (name === 'practice') {
    return (OUTCOME_IDS as string[]).includes(id) ? { name: 'practice', topic: id as OutcomeId } : { name: 'practice' }
  }
  if (name === 'playground') return playground(id, rest[0], rest[1])
  if ((SIMPLE as readonly string[]).includes(name)) return { name } as Route
  return { name: 'home' }
}

export function href(route: Route): string {
  if (route.name === 'home') return '#/'
  if (route.name === 'lesson') return `#/lesson/${route.id}`
  if (route.name === 'practice' && route.topic) return `#/practice/${route.topic}`
  if (route.name === 'playground' && route.op) {
    const preset = route.preset ?? (route.key === undefined ? undefined : DEFAULT_PRESET)
    return ['#/playground', route.op, preset, route.key].filter((p) => p !== undefined).join('/')
  }
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
