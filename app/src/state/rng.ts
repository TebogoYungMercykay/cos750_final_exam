import { seeded, type Rng } from '../engine/random'

/** The seed in a `?seed=42` URL, or null. Only whole numbers count. */
export function seedFrom(search: string): number | null {
  const value = new URLSearchParams(search).get('seed')
  return value !== null && /^\d{1,9}$/.test(value) ? Number(value) : null
}

/** The demo seed for this page load, if the URL has one. */
export const DEMO_SEED = seedFrom(window.location.search)

export const rngFor = (seed: number | null): Rng => (seed === null ? Math.random : seeded(seed))

/**
 * Randomness for generated questions. With a demo seed, every question repeats
 * in the same order after a reload, so a live demonstration never surprises
 * the presenter. One generator serves the whole page load.
 */
export const appRng: Rng = rngFor(DEMO_SEED)
