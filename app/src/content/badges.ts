import { Dumbbell, Gauge, GraduationCap, Layers, Network, Rows3, Scale, Search, Sprout, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Badge {
  icon: LucideIcon
  name: string
  description: string
}

export const BADGES = {
  warmup: { icon: Sprout, name: 'Warm-up', description: 'Completed the warm-up check' },
  m1: { icon: Network, name: 'Tree vocabulary', description: 'Finished Trees 101' },
  m2: { icon: Scale, name: 'The BST rule', description: 'Finished The BST rule' },
  m3: { icon: Search, name: 'Search and insert', description: 'Finished Search and insert' },
  m4: { icon: Layers, name: 'Depth first', description: 'Finished Tree search: depth first' },
  m5: { icon: Rows3, name: 'Breadth first', description: 'Finished Tree search: breadth first' },
  m6: { icon: Gauge, name: 'Shape and cost', description: 'Finished Shape and efficiency' },
  practice10: { icon: Dumbbell, name: 'Ten practice trees', description: 'Solved 10 practice exercises' },
  nohints: { icon: Target, name: 'Unaided checkpoint', description: 'A perfect checkpoint without hints' },
  ready: {
    icon: GraduationCap,
    name: 'Lecture ready',
    description: '70% or more on every outcome in the readiness check',
  },
} satisfies Record<string, Badge>

export type BadgeId = keyof typeof BADGES
