import type { Mode } from '../state/progress'
import type { Route } from '../state/router'

export interface TourStep {
  /** The page the step is shown on; the tour opens it first. */
  route: Route
  /** The `data-tour` value of the element to point at. Without one, the step is a centred card. */
  target?: string
  title: string
  body: string | ((mode: Mode) => string)
}

/** Cards stay this short so the tour is read, not skimmed; the test fails any card that is longer. */
export const MAX_BODY = 130

const home: Route = { name: 'home' }

/**
 * The app's one tour: shown once, to a new learner, across every main page.
 * The profile menu replays it; it always ends on the home page.
 */
export const TOUR: TourStep[] = [
  {
    route: home,
    title: 'Welcome to TreeTutor',
    body: 'A one minute tour of the COS212 app. Use Next and Back, or skip at any time.',
  },
  {
    route: home,
    target: 'nav',
    title: 'Five sections',
    body: 'Path holds the lessons, Playground your own trees, Practice extra questions, Readiness the final check, Progress your results.',
  },
  {
    route: home,
    target: 'cta',
    title: 'Start here',
    body: 'Begin with the two minute warm-up, then take the lessons in order.',
  },
  {
    route: home,
    target: 'path',
    title: 'Six lessons',
    body: 'Lessons 1 to 3 teach the binary search tree, 4 and 5 teach tree search, and 6 ties them together.',
  },
  {
    route: home,
    target: 'mode',
    title: 'Standard or guided',
    body: (mode) =>
      mode === 'guided'
        ? 'Guided mode explains every line of code and shows hints early. Switch here at any time.'
        : 'Standard mode shows the key steps. Guided mode explains every line; switch here at any time.',
  },
  {
    route: { name: 'lesson', id: 'm1' },
    target: 'lesson-objective',
    title: 'Every lesson',
    body: 'Each lesson states its goal, teaches one idea per step, and ends with a short checkpoint.',
  },
  {
    route: { name: 'playground', op: 'search', preset: 'lecture', key: 20 },
    target: 'player-code',
    title: 'Animations',
    body: 'The highlighted line of Java is the one running; the tree and the text below show what it did.',
  },
  {
    route: { name: 'playground', op: 'search', preset: 'lecture', key: 20 },
    target: 'player-controls',
    title: 'Your pace',
    body: 'Step forward and back, or press Play.',
  },
  {
    route: { name: 'practice', topic: 'LO3' },
    target: 'question-answer',
    title: 'Questions',
    body: 'Answer here. A wrong answer explains itself, and hints appear after a mistake.',
  },
  {
    route: { name: 'check' },
    target: 'check-start',
    title: 'Readiness check',
    body: 'Twelve questions tell you which parts of the lecture you are ready for.',
  },
  {
    route: { name: 'progress' },
    target: 'progress-card',
    title: 'Your lecture card',
    body: 'Your results and notes, ready to print and take to the lecture.',
  },
  {
    route: home,
    target: 'profile',
    title: 'Your profile',
    body: 'Change your name, text size or read aloud, replay this tour, or reset, from here.',
  },
]

export const bodyOf = (step: TourStep, mode: Mode) => (typeof step.body === 'string' ? step.body : step.body(mode))
