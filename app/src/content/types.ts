import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tree } from '../engine/bst'
import type { FrontierTraceKind, TraceKind, TraversalKind } from '../engine/traces'

export type OutcomeId = 'LO1' | 'LO2' | 'LO3' | 'LO4' | 'LO5' | 'LO6'
export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6'

/** Revised Bloom's taxonomy, lowest level first. */
export const BLOOM = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'] as const
export type BloomLevel = (typeof BLOOM)[number]

/**
 * Gagné's nine events of instruction, in order: gain attention, state the
 * objective, recall prior learning, present content, guide learning, elicit
 * performance, give feedback, assess performance, aid retention and transfer.
 */
export type GagneEvent = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface Outcome {
  short: string
  text: string
  /** The levels this outcome is taught and assessed at; every question for it sits at one of them. */
  bloom: BloomLevel[]
  module: ModuleId
}

interface QuestionBase {
  id: string
  lo: OutcomeId | 'PRE'
  prompt: string
  hints: string[]
  explain: string
  code?: string
  bloom: BloomLevel
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq'
  options: string[]
  answer: number
  /** What each wrong option shows, aimed at the misconception behind it. Empty at the answer. */
  feedback: string[]
  tree?: Tree
  violation?: number
}

export interface NodeQuestion extends QuestionBase {
  type: 'node'
  tree: Tree
  answer: number[]
  violation?: number
}

export interface SlotQuestion extends QuestionBase {
  type: 'slot'
  tree: Tree
  value: number
}

export interface OrderQuestion extends QuestionBase {
  type: 'order'
  tree: Tree
  kind: TraversalKind
}

export type Question = McqQuestion | NodeQuestion | SlotQuestion | OrderQuestion

export type Section =
  | { type: 'text'; title: string; body: ReactNode; warning?: boolean }
  | { type: 'explore'; title: string; tree: Tree; caption: string }
  | { type: 'tree'; title: string; tree: Tree; caption: string; violation?: number }
  | {
      type: 'figure'
      title: string
      tree: Tree
      caption: string
      body: ReactNode
      /** Labels drawn above nodes, keyed by node. */
      labels?: Partial<Record<number, string>>
      ruler?: boolean
      nulls?: boolean
    }
  | { type: 'animate'; title: string; tree: Tree; kind: TraceKind; key?: number; callout?: string }
  | {
      type: 'frontier'
      title: string
      tree: Tree
      caption: string
      /** The key the tree search looks for. A key not in the tree makes it check every node. */
      key: number
      /** One frontier only; without it the learner switches between a queue and a stack. */
      kind?: FrontierTraceKind
    }
  | { type: 'compare'; title: string; items: { tree: Tree; caption: string }[] }
  | { type: 'try'; title: string; question: Question }
  | { type: 'reflect'; id: string; prompt: string }

/** A section's Gagné event, when it differs from the one its type usually plays. */
export type TaggedSection = Section & { event?: GagneEvent }

/** Which half of the app's choice a lesson teaches: the data structure, the algorithm, or the two together. */
export type Part = 'structure' | 'algorithm' | 'both'

export interface Module {
  id: ModuleId
  lo: OutcomeId
  part: Part
  icon: LucideIcon
  minutes: number
  title: string
  tagline: string
  hook: ReactNode
  /** What the learner already knows that this lesson builds on: Gagné's third event. */
  recall: ReactNode
  sections: TaggedSection[]
  quiz: Question[]
  summary: string[]
}

/** What a learner did on one question, and the credit it earned. */
export interface Answer {
  id: string
  lo: OutcomeId | 'PRE'
  score: number
  mistakes: number
  hintsUsed: number
  revealed: boolean
}
