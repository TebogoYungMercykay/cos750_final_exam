import type { OutcomeId } from './types'

export const PRESETS = [
  { id: 'balanced', name: 'Balanced, 7 keys', keys: [50, 30, 70, 20, 40, 60, 80] },
  { id: 'lecture', name: 'Lecture example', keys: [15, 9, 23, 4, 12, 20, 27] },
  { id: 'uneven', name: 'Uneven', keys: [40, 20, 60, 10, 30, 50, 70, 25, 27] },
  { id: 'sorted', name: 'Sorted input', keys: [10, 20, 30, 40, 50, 60] },
] as const

export type PresetId = (typeof PRESETS)[number]['id']

/** The tree the playground opens with. */
export const DEFAULT_PRESET: PresetId = 'lecture'

export const OPERATIONS = [
  { id: 'search', label: 'BST search' },
  { id: 'insert', label: 'Insert' },
  { id: 'pre', label: 'Pre-order' },
  { id: 'in', label: 'In-order' },
  { id: 'post', label: 'Post-order' },
  { id: 'level', label: 'Level-order' },
  { id: 'frontier', label: 'Tree search' },
] as const

export type Operation = (typeof OPERATIONS)[number]['id']

/** A key typed or linked by the learner: a whole number from 0 to 999 written in digits, or null. */
export function parseKey(text: string | undefined): number | null {
  const trimmed = text?.trim() ?? ''
  return /^\d{1,3}$/.test(trimmed) ? Number(trimmed) : null
}

export interface Review {
  op: Operation
  preset: PresetId
  key?: number
  label: string
}

/**
 * For an outcome below the readiness bar, an animation of the same idea, so
 * the learner meets it again as a picture run step by step rather than as
 * another question (UDL: more than one means of representation).
 */
export const REVIEW: Record<OutcomeId, Review> = {
  LO1: { op: 'level', preset: 'uneven', label: 'See it row by row' },
  LO2: { op: 'in', preset: 'balanced', label: 'Watch the rule sort the keys' },
  LO3: { op: 'search', preset: 'lecture', key: 12, label: 'Watch a search' },
  LO4: { op: 'pre', preset: 'lecture', label: 'Watch a depth first walk' },
  LO5: { op: 'frontier', preset: 'lecture', key: 20, label: 'Watch tree search at work' },
  LO6: { op: 'search', preset: 'sorted', key: 60, label: 'Watch a search in a chain' },
}
