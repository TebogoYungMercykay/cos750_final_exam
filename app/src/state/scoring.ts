import type { Answer, OutcomeId } from '../content/types'

/** Mastery at or above this counts as ready for that part of the lecture. */
export const READY = 0.7

/** Mastery is the mean of this many most recent answers per outcome. */
export const MEMORY = 10

const CREDIT = [1, 0.6, 0.3]

/** Full credit for a clean answer, less for each hint or mistake, none once the answer is revealed. */
export function credit(attempts: number, revealed: boolean): number {
  return revealed ? 0 : (CREDIT[attempts] ?? 0.1)
}

export interface Summary {
  overall: number
  noHints: boolean
  perOutcome: Partial<Record<OutcomeId, number>>
}

export function summarise(answers: readonly Answer[]): Summary {
  const totals: Partial<Record<OutcomeId, { sum: number; n: number }>> = {}
  for (const a of answers) {
    if (a.lo === 'PRE') continue
    const t = (totals[a.lo] ??= { sum: 0, n: 0 })
    t.sum += a.score
    t.n += 1
  }
  const perOutcome = Object.fromEntries(Object.entries(totals).map(([lo, t]) => [lo, t.sum / t.n]))
  return {
    overall: answers.reduce((sum, a) => sum + a.score, 0) / Math.max(1, answers.length),
    noHints: answers.every((a) => a.mistakes === 0 && a.hintsUsed === 0 && !a.revealed),
    perOutcome,
  }
}

export function mastery(results: Partial<Record<OutcomeId, number[]>>, lo: OutcomeId): number | null {
  const scores = results[lo]
  return scores && scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

export function remember(scores: readonly number[] | undefined, score: number): number[] {
  return [...(scores ?? []), score].slice(-MEMORY)
}

export const percent = (value: number) => `${Math.round(value * 100)}%`
