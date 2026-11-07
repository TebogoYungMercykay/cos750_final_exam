import type { Mode } from '../state/progress'

export interface ModeInfo {
  name: string
  summary: string
  features: string[]
}

/** The one description of each support mode. The header, warm-up, lesson intro, step player and tours all read it. */
export const MODES: Record<Mode, ModeInfo> = {
  standard: {
    name: 'Standard',
    summary: 'For moving at your own pace once the basics make sense.',
    features: [
      'Animations move one decision at a time.',
      'Hints appear when you ask for one or after a mistake.',
      'Animations play at normal speed.',
    ],
  },
  guided: {
    name: 'Guided',
    summary: 'For meeting trees for the first time. Nothing is skipped.',
    features: [
      'Animations walk through every line of code, including the checks.',
      'Each step says why it happens, and the tree is labelled as it changes.',
      'The highlighted line of code is explained.',
      'Every question shows its first hint and how to answer it.',
      'Animations play more slowly.',
    ],
  },
}

/** Default milliseconds per animation step. */
export const SPEED: Record<Mode, number> = { standard: 1000, guided: 1600 }
