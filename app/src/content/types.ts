import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Tree } from '../engine/bst'
import type { TraceKind, TraversalKind } from '../engine/traces'

export type OutcomeId = 'LO1' | 'LO2' | 'LO3' | 'LO4' | 'LO5' | 'LO6'
export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6'

export interface Outcome {
  short: string
  text: string
  bloom: string
  module: ModuleId
}

interface QuestionBase {
  id: string
  lo: OutcomeId | 'PRE'
  prompt: string
  hints: string[]
  explain: string
  code?: string
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq'
  options: string[]
  answer: number
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
  | { type: 'animate'; title: string; tree: Tree; kind: TraceKind; key?: number; callout?: string }
  | { type: 'frontier'; title: string; tree: Tree; caption: string }
  | { type: 'compare'; title: string; items: { tree: Tree; caption: string }[] }
  | { type: 'try'; title: string; question: Question }
  | { type: 'reflect'; id: string; prompt: string }

export interface Module {
  id: ModuleId
  lo: OutcomeId
  icon: LucideIcon
  minutes: number
  title: string
  tagline: string
  hook: ReactNode
  sections: Section[]
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
