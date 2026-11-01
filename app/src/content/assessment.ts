import { firstViolation, height, leaves, node, parentOf, type Tree, type TreeNode } from '../engine/bst'
import { freshKey, pick, randomTree, shuffle, type Rng } from '../engine/random'
import { searchTrace, TRAVERSALS } from '../engine/traces'
import { depthFirstOrder } from '../engine/traversal'
import type { McqQuestion, OutcomeId, Question } from './types'

export const WARMUP: McqQuestion[] = [
  {
    id: 'w1',
    lo: 'PRE',
    type: 'mcq',
    prompt: 'A stack of plates: which plate do you take off first?',
    options: ['The one that was put on first', 'The one that was put on last', 'A random one'],
    answer: 1,
    hints: [],
    explain: 'Stacks are last in, first out (LIFO).',
  },
  {
    id: 'w2',
    lo: 'PRE',
    type: 'mcq',
    prompt: 'People waiting in a queue at the canteen: who is served first?',
    options: ['The person who arrived first', 'The person who arrived last', 'The shortest person'],
    answer: 0,
    hints: [],
    explain: 'Queues are first in, first out (FIFO).',
  },
  {
    id: 'w3',
    lo: 'PRE',
    type: 'mcq',
    prompt: 'What does f(3) return?',
    code: 'int f(int n) {\n  if (n == 0) return 0;\n  return n + f(n - 1);\n}',
    options: ['3', '5', '6', 'It never stops'],
    answer: 2,
    hints: [],
    explain: 'f(3) = 3 + f(2) = 3 + 2 + f(1) = 3 + 2 + 1 + f(0) = 6. A function calling itself is called recursion.',
  },
  {
    id: 'w4',
    lo: 'PRE',
    type: 'mcq',
    prompt: 'You keep halving 16: 16, 8, 4 and so on. How many halvings until you reach 1?',
    options: ['2', '4', '8', '16'],
    answer: 1,
    hints: [],
    explain: '16, 8, 4, 2, 1 is 4 halvings. That is log₂ 16 = 4, an idea that returns in lesson 6.',
  },
]

export const CONFIDENCE = ['Never heard of them', 'I have heard of them', 'I have used them a little']

/** Guided mode when the warm-up shows gaps or the learner says trees are new to them. */
export function needsGuidance(correct: number, confidence: number): boolean {
  return correct <= 2 || confidence === 0
}

export const BANK: McqQuestion[] = [
  {
    id: 'a1',
    lo: 'LO1',
    type: 'mcq',
    prompt: 'Which statement is TRUE for every tree?',
    options: [
      'Every node has two children',
      'Every node except the root has exactly one parent',
      'Leaves have exactly one child',
      'There can be several roots',
    ],
    answer: 1,
    hints: ['Think about the root: does it have a parent?'],
    explain: 'Each non-root node has exactly one parent; the root has none.',
  },
  {
    id: 'a2',
    lo: 'LO2',
    type: 'mcq',
    prompt: 'A node with key 40 has a left subtree. Which key is NOT allowed anywhere in that left subtree?',
    options: ['5', '22', '39', '41'],
    answer: 3,
    hints: ['Left subtree keys must be smaller.'],
    explain: '41 > 40, so it cannot be in the left subtree.',
  },
  {
    id: 'a3',
    lo: 'LO3',
    type: 'mcq',
    prompt: 'Where does a newly inserted key end up in a BST?',
    options: [
      'Always at the root',
      'Always as a new leaf',
      'In the middle, shifting other nodes down',
      'At the end of the in-order sequence',
    ],
    answer: 1,
    hints: ['Insertion is an unsuccessful search plus a new node at the null spot.'],
    explain: 'Insert attaches the new node where the search fell off the tree: a leaf position.',
  },
  {
    id: 'a4',
    lo: 'LO4',
    type: 'mcq',
    prompt: 'The in-order traversal of a BST is 3, 8, 11, 17, 25. What can you conclude?',
    options: [
      '3 is the root',
      '25 is the root',
      'Nothing: in-order of a BST is always sorted, so the root cannot be determined',
      '11 must be a leaf',
    ],
    answer: 2,
    hints: ['Many differently shaped BSTs have the same sorted in-order sequence.'],
    explain: 'Every BST with these keys has this in-order sequence, so it does not reveal the shape or the root.',
  },
  {
    id: 'a5',
    lo: 'LO5',
    type: 'mcq',
    prompt: 'During level-order traversal, node 12 is dequeued and has children 7 and 19. What happens next?',
    options: [
      '7 and 19 are visited immediately',
      '7 then 19 are added to the BACK of the queue',
      '19 then 7 are pushed onto a stack',
      'Nothing, children are ignored',
    ],
    answer: 1,
    hints: ['Children must wait until the current level is finished.'],
    explain: 'The children are enqueued, left first, and visited after the nodes already waiting in the queue.',
  },
  {
    id: 'a6',
    lo: 'LO6',
    type: 'mcq',
    prompt: 'Why can a BST built from already sorted input be slow to search?',
    options: [
      'Sorted data cannot be stored in a BST',
      'It becomes a tall chain with height n − 1, so search is O(n)',
      'In-order traversal stops working',
      'The root becomes too large',
    ],
    answer: 1,
    hints: ['Draw the tree after inserting 1, 2, 3, 4.'],
    explain: 'Each key goes to the right of the previous one: height n − 1, so search degrades to O(n).',
  },
  {
    id: 'a7',
    lo: 'LO6',
    type: 'mcq',
    prompt:
      'You need to save a BST to a file so that rebuilding it, by inserting in file order, gives the SAME shape. Which traversal should you write out?',
    options: ['In-order', 'Pre-order', 'Post-order', 'Any traversal works'],
    answer: 1,
    hints: [
      'Parents must be inserted before their children.',
      'In-order would insert sorted keys and produce a chain.',
    ],
    explain: 'Pre-order lists each parent before its subtrees, so inserting in that order recreates the same tree.',
  },
  {
    id: 'a8',
    lo: 'LO6',
    type: 'mcq',
    prompt: 'Roughly how many comparisons are needed to search a well balanced BST holding about 1 000 000 keys?',
    options: ['about 20', 'about 1 000', 'about 500 000', 'about 1 000 000'],
    answer: 0,
    hints: ['What is log₂(1 000 000)?', '2¹⁰ ≈ 1 000, so 2²⁰ ≈ 1 000 000.'],
    explain: 'A balanced tree has height ≈ log₂ n ≈ 20.',
  },
]

let serial = 0
const freshId = (prefix: string) => `${prefix}-${++serial}`

/** Up to four sorted options around the right number, so neighbours act as distractors. */
function numberOptions(right: number, near: number[], far: number) {
  const values = [...new Set([right, ...near, far])].sort((a, b) => a - b).slice(0, 4)
  return { options: values.map(String), answer: values.indexOf(right) }
}

function withKeyChanged(root: TreeNode, from: number, to: number): TreeNode {
  const swap = (n: Tree): Tree => (n === null ? null : node(n.key === from ? to : n.key, swap(n.left), swap(n.right)))
  return swap(root) as TreeNode
}

/**
 * Half the time, breaks the rule by giving the root's inner grandchild side a
 * key from the wrong side of the root: the misconception lesson 2 targets.
 */
function maybeBroken(tree: TreeNode, rng: Rng): Tree {
  if (rng() < 0.5) return tree
  const side = tree.left ? 'left' : 'right'
  const inner = side === 'left' ? 'right' : 'left'
  let target = tree[side]!
  while (target[inner]) target = target[inner]!
  const taken = new Set(depthFirstOrder(tree, 'in'))
  const step = side === 'left' ? 1 : -1
  let key = tree.key + step
  while (taken.has(key) && key > 0 && key < 100) key += step
  return withKeyChanged(tree, target.key, key)
}

type Generator = (rng: Rng) => Question

export const GENERATORS: Record<Exclude<OutcomeId, 'LO6'>, Generator> = {
  LO1: (rng) => {
    const tree = randomTree(7, rng) as TreeNode
    const kind = pick(['leaf', 'parent', 'height'] as const, rng)
    if (kind === 'leaf') {
      return {
        id: freshId('g1'),
        lo: 'LO1',
        type: 'node',
        tree,
        answer: leaves(tree),
        prompt: 'Click any leaf of this tree.',
        hints: ['A leaf has no children.'],
        explain: `The leaves are ${leaves(tree).join(', ')}.`,
      }
    }
    if (kind === 'parent') {
      const child = pick(
        depthFirstOrder(tree, 'in').filter((k) => k !== tree.key),
        rng,
      )
      const parent = parentOf(tree, child)!.key
      return {
        id: freshId('g1'),
        lo: 'LO1',
        type: 'node',
        tree,
        answer: [parent],
        prompt: `Click the PARENT of ${child}.`,
        hints: ['The parent is directly above, connected by one edge.'],
        explain: `${parent} is directly above ${child}.`,
      }
    }
    const h = height(tree)
    return {
      id: freshId('g1'),
      lo: 'LO1',
      type: 'mcq',
      tree,
      prompt: 'What is the height of this tree, counting edges?',
      ...numberOptions(h, [h + 1, Math.max(0, h - 1)], 7),
      hints: ['Count the edges on the longest root to leaf path.'],
      explain: `The longest root to leaf path has ${h} edges.`,
    }
  },
  LO2: (rng) => {
    const tree = maybeBroken(randomTree(7, rng) as TreeNode, rng)
    const violation = firstViolation(tree)
    return {
      id: freshId('g2'),
      lo: 'LO2',
      type: 'mcq',
      tree,
      violation: violation ?? undefined,
      prompt: 'Is this a valid BST?',
      options: ['Yes', 'No'],
      answer: violation === null ? 0 : 1,
      hints: ['Check every node against ALL its ancestors, not only its parent.'],
      explain:
        violation === null
          ? 'Every node satisfies left < node < right for its whole subtree.'
          : `${violation} is on the wrong side of one of its ancestors, so the tree is not a BST.`,
    }
  },
  LO3: (rng) => {
    const tree = randomTree(7, rng) as TreeNode
    if (rng() < 0.6) {
      const value = freshKey(tree, rng)
      return {
        id: freshId('g3'),
        lo: 'LO3',
        type: 'slot',
        tree,
        value,
        prompt: `Click where ${value} will be inserted.`,
        hints: [
          `Start at the root (${tree.key}). Is ${value} smaller or larger?`,
          'Keep going left or right until you reach an empty (+) spot.',
        ],
        explain: `Follow the search path for ${value}; the empty spot where it falls off the tree is where it is inserted.`,
      }
    }
    const key = pick(depthFirstOrder(tree, 'in'), rng)
    const path = searchTrace(tree, key).at(-1)!.path
    return {
      id: freshId('g3'),
      lo: 'LO3',
      type: 'mcq',
      tree,
      prompt: `How many nodes are compared when searching for ${key}?`,
      ...numberOptions(path.length, [path.length + 1, Math.max(1, path.length - 1)], 7),
      hints: ['Start at the root and count every node you look at, including the one that matches.'],
      explain: `The search path is ${path.join(' → ')}: ${path.length} comparison${path.length > 1 ? 's' : ''}.`,
    }
  },
  LO4: (rng) => {
    const kind = pick(['pre', 'in', 'post'] as const, rng)
    const first = { pre: 'The root is first.', in: 'For a BST, in-order is sorted order.', post: 'The root is last.' }
    return {
      id: freshId('g4'),
      lo: 'LO4',
      type: 'order',
      kind,
      tree: randomTree(7, rng),
      prompt: `Click the nodes in ${TRAVERSALS[kind].label.toUpperCase()} (${TRAVERSALS[kind].rule}).`,
      hints: [first[kind], 'Finish an entire left subtree before you start the right subtree.'],
      explain: '',
    }
  },
  LO5: (rng) => ({
    id: freshId('g5'),
    lo: 'LO5',
    type: 'order',
    kind: 'level',
    tree: randomTree(8, rng),
    prompt: 'Click the nodes in LEVEL-ORDER.',
    hints: ['Row by row, from the top; left to right in each row.'],
    explain: '',
  }),
}

/** A fresh question for one outcome: generated where a generator exists, else from the bank. */
export function questionFor(lo: OutcomeId, rng: Rng): Question {
  if (lo !== 'LO6') return GENERATORS[lo](rng)
  const base = pick(
    BANK.filter((q) => q.lo === lo),
    rng,
  )
  return { ...base, id: freshId(base.id) }
}

/** Two questions per outcome: one from the bank and one generated, or two bank items for LO6. */
export function readinessSet(rng: Rng): Question[] {
  const set: Question[] = []
  for (const lo of ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6'] as const) {
    const bank = shuffle(
      BANK.filter((q) => q.lo === lo),
      rng,
    )
    if (lo === 'LO6') set.push(...bank.slice(0, 2))
    else set.push(bank[0], GENERATORS[lo](rng))
  }
  return set
}
