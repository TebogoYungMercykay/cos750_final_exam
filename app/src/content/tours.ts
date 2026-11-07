import type { Mode } from '../state/progress'
import { MODES } from './modes'

export type TourId = 'home' | 'lesson' | 'lesson-steps' | 'player' | 'question' | 'playground'

export interface TourStep {
  /** The `data-tour` value of the element to point at. Without one, the step is a centred card. */
  target?: string
  title: string
  body: string | ((mode: Mode) => string)
  /** Shown only in this mode. Guided tours explain more; standard tours keep to the essentials. */
  only?: Mode
}

export interface Tour {
  name: string
  steps: TourStep[]
}

const other = (mode: Mode): Mode => (mode === 'guided' ? 'standard' : 'guided')

const modeBody = (mode: Mode) =>
  `You are in ${MODES[mode].name.toLowerCase()} mode. ${MODES[mode].summary} ${MODES[mode].features.join(' ')} ` +
  `Click here to switch to ${MODES[other(mode)].name.toLowerCase()} mode at any time.`

export const TOURS: Record<TourId, Tour> = {
  home: {
    name: 'Getting started',
    steps: [
      {
        title: 'Welcome to TreeTutor, the COS212 app',
        body: (mode) =>
          mode === 'guided'
            ? 'This tour points out each part of the screen and what it does. Use Next and Back, or the arrow keys. Skip whenever you like: the question mark button at the top brings any tour back.'
            : 'A quick look at the screen. Use Next and Back, or the arrow keys, and skip whenever you like. The question mark button at the top brings any tour back.',
      },
      {
        target: 'nav',
        title: 'The five sections',
        body: 'Path holds the six lessons. Playground lets you build your own tree and run any operation on it. Practice gives unlimited exercises. Readiness tells you whether you are ready for the lecture. Progress keeps your scores and notes.',
      },
      {
        target: 'cta',
        title: 'Your next step',
        body: 'This button always points to what to do next: first a two minute warm-up, then the lessons in order, then the readiness check.',
      },
      {
        target: 'path',
        title: 'The learning path',
        body: 'Six short lessons of about ten minutes each. Every lesson starts from a familiar idea, shows worked examples, lets you try, asks you to reflect, and ends with a short checkpoint.',
        only: 'guided',
      },
      {
        target: 'stats',
        title: 'Your numbers',
        body: 'Lessons finished, average mastery, badges and experience points. Mastery is worked out per learning outcome from your recent answers: 70% or more means you are ready for that part of the lecture.',
        only: 'guided',
      },
      { target: 'mode', title: 'Standard or guided', body: modeBody },
      {
        target: 'xp',
        title: 'Experience points',
        body: 'Points for answers, lessons and badges. They show effort; mastery is what tells you whether you are ready.',
        only: 'guided',
      },
      {
        target: 'theme',
        title: 'Light or dark',
        body: 'Switch the colour theme. The app remembers your choice.',
        only: 'guided',
      },
      {
        target: 'help',
        title: 'Help is always here',
        body: 'Click the question mark on any screen to replay the tours for that screen.',
      },
    ],
  },
  lesson: {
    name: 'How a lesson works',
    steps: [
      {
        target: 'lesson-objective',
        title: 'What you will be able to do',
        body: 'Each lesson has one learning outcome. The checkpoint at the end tests exactly this.',
      },
      {
        target: 'lesson-meter',
        title: 'How far you are',
        body: 'This bar fills as you move through the steps of the lesson.',
        only: 'guided',
      },
      {
        target: 'lesson-start',
        title: 'Start, or skip ahead',
        body: (mode) =>
          mode === 'guided'
            ? 'Start the lesson to work through it step by step. You may skip straight to the checkpoint if you already know the topic, but in guided mode we suggest doing the steps first.'
            : 'Start the lesson, or skip straight to the checkpoint if you already know the topic.',
      },
    ],
  },
  'lesson-steps': {
    name: 'Moving through a lesson',
    steps: [
      {
        target: 'lesson-outline',
        title: 'The steps of this lesson',
        body: 'Jump to any step from this list. Steps you have passed are marked as done.',
      },
      {
        target: 'lesson-step',
        title: 'One idea at a time',
        body: (mode) =>
          mode === 'guided'
            ? 'Each step teaches one idea: an explanation, a worked example, something to try or a question to reflect on. Take your time; nothing here is marked.'
            : 'Each step teaches one idea. Nothing here is marked until the checkpoint.',
      },
      {
        target: 'lesson-nav',
        title: 'Back and Next',
        body: 'Move between steps at your own pace. After the last step comes the checkpoint.',
      },
    ],
  },
  player: {
    name: 'Reading an animation',
    steps: [
      {
        target: 'player-tree',
        title: 'The tree',
        body: (mode) =>
          mode === 'guided'
            ? 'The tree shows the state at this step, and the legend underneath explains each style. A label above the current node says what is happening to it.'
            : 'The tree shows the state at this step. The legend underneath explains each style.',
      },
      {
        target: 'player-code',
        title: 'The code',
        body: (mode) =>
          mode === 'guided'
            ? 'The Java code for this operation. The highlighted line is the one running now, and the note underneath says what it does to the tree.'
            : 'The Java code for this operation. The highlighted line is the one running now.',
      },
      {
        target: 'player-memory',
        title: 'What the code remembers',
        body: 'The call stack, queue or stack the code is using, and the output so far. Every list reads with the next one out first, on the left.',
      },
      {
        target: 'player-narration',
        title: 'What just happened',
        body: (mode) =>
          mode === 'guided'
            ? 'Each step is described in words, followed by why it happens. A screen reader reads this out.'
            : 'Each step is described in words. A screen reader reads this out.',
      },
      {
        target: 'player-controls',
        title: 'You set the pace',
        body: 'Step forward and back, or press Play. Restart goes back to the beginning, and Speed sets how fast Play moves.',
      },
      {
        target: 'player-mode',
        title: 'Every line, or key steps',
        body: (mode) =>
          mode === 'guided'
            ? 'Guided mode shows every line of code, including checks that change nothing on screen. Standard mode shows only the steps where something changes.'
            : 'Standard mode shows only the steps where something changes. Guided mode also shows every check in between, with the reason for each step.',
      },
    ],
  },
  question: {
    name: 'Answering questions',
    steps: [
      {
        target: 'question-prompt',
        title: 'The question',
        body: 'Read the task carefully. Some questions ask you to choose an option, others to click in the tree.',
      },
      {
        target: 'question-answer',
        title: 'Your answer',
        body: (mode) =>
          mode === 'guided'
            ? 'Answer here. A wrong choice is marked and you can try again. Guided mode shows the first hint straight away, and tells you how to answer when the question uses the tree.'
            : 'Answer here. A wrong choice is marked and you can try again.',
      },
      {
        title: 'Hints and credit',
        body: 'When a question has hints, a Need a hint? button appears below it. A clean answer earns full credit, each hint or mistake a little less. After three wrong tries you can ask to see the answer, with an explanation.',
      },
    ],
  },
  playground: {
    name: 'The playground',
    steps: [
      {
        target: 'pg-build',
        title: 'Build a tree',
        body: 'Pick a ready-made tree, or type your own keys and press Add. The preset in blue is the tree you are using. Clear starts from an empty tree.',
      },
      {
        target: 'pg-run',
        title: 'Run an operation',
        body: 'Choose an operation, enter a key where one is needed, and press Run. The animation opens below and the page scrolls to it.',
      },
    ],
  },
}

export const bodyOf = (step: TourStep, mode: Mode) => (typeof step.body === 'string' ? step.body : step.body(mode))

/** The steps a learner sees in a mode. */
export const stepsFor = (id: TourId, mode: Mode) => TOURS[id].steps.filter((s) => !s.only || s.only === mode)
