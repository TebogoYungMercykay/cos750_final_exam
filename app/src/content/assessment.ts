import {
  balancedFrom,
  firstViolation,
  fromKeys,
  height,
  leaves,
  node,
  parentOf,
  type Tree,
  type TreeNode,
} from '../engine/bst'
import { freshKey, pick, randomTree, shuffle, type Rng } from '../engine/random'
import { searchTrace, TRAVERSALS } from '../engine/traces'
import { depthFirstOrder } from '../engine/traversal'
import type { McqQuestion, OutcomeId, Question } from './types'

export const WARMUP: McqQuestion[] = [
  {
    id: 'w1',
    lo: 'PRE',
    type: 'mcq',
    bloom: 'Remember',
    prompt: 'A stack of plates: which plate do you take off first?',
    options: ['The one that was put on first', 'The one that was put on last', 'A random one'],
    answer: 1,
    feedback: [
      'The first plate is at the bottom. You take from the top: the one put on last.',
      '',
      'A stack always gives back the most recent item: last in, first out.',
    ],
    hints: [],
    explain: 'Stacks are last in, first out (LIFO).',
  },
  {
    id: 'w2',
    lo: 'PRE',
    type: 'mcq',
    bloom: 'Remember',
    prompt: 'People waiting in a queue at the canteen: who is served first?',
    options: ['The person who arrived first', 'The person who arrived last', 'The shortest person'],
    answer: 0,
    feedback: [
      '',
      'The last person to arrive waits at the back. A queue serves people in the order they arrived.',
      'A queue serves people in the order they arrived: first in, first out.',
    ],
    hints: [],
    explain: 'Queues are first in, first out (FIFO).',
  },
  {
    id: 'w3',
    lo: 'PRE',
    type: 'mcq',
    bloom: 'Apply',
    prompt: 'What does f(3) return?',
    code: 'int f(int n) {\n  if (n == 0) return 0;\n  return n + f(n - 1);\n}',
    options: ['3', '5', '6', 'It never stops'],
    answer: 2,
    feedback: [
      'f(3) adds 3 to f(2), and f(2) is not 0. Follow the calls down to f(0).',
      'Add every value on the way down: 3 + 2 + 1 + 0.',
      '',
      'Each call passes n − 1, so it reaches the base case f(0), which returns 0.',
    ],
    hints: [],
    explain: 'f(3) = 3 + f(2) = 3 + 2 + f(1) = 3 + 2 + 1 + f(0) = 6. A function calling itself is called recursion.',
  },
  {
    id: 'w4',
    lo: 'PRE',
    type: 'mcq',
    bloom: 'Apply',
    prompt: 'You keep halving 16: 16, 8, 4 and so on. How many halvings until you reach 1?',
    options: ['2', '4', '8', '16'],
    answer: 1,
    feedback: [
      '16, 8, 4 is only two halvings. Keep going until you reach 1.',
      '',
      '8 is half of 16: a value, not the number of halvings.',
      '16 is the starting value. Count the halvings: 16, 8, 4, 2, 1.',
    ],
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
    bloom: 'Understand',
    prompt: 'Which statement is TRUE for every tree?',
    options: [
      'Every node has two children',
      'Every node except the root has exactly one parent',
      'Leaves have exactly one child',
      'There can be several roots',
    ],
    answer: 1,
    feedback: [
      'Leaves have no children, and some nodes have only one.',
      '',
      'A leaf has no children: that is what makes it a leaf.',
      'A tree has exactly one root, the only node without a parent.',
    ],
    hints: ['Think about the root: does it have a parent?'],
    explain: 'Each non-root node has exactly one parent; the root has none.',
  },
  {
    id: 'a2',
    lo: 'LO2',
    type: 'mcq',
    bloom: 'Apply',
    prompt: 'A node with key 40 has a left subtree. Which key is NOT allowed anywhere in that left subtree?',
    options: ['5', '22', '39', '41'],
    answer: 3,
    feedback: [
      '5 is smaller than 40, so it may be in the left subtree. Look for a key that is not allowed.',
      '22 is smaller than 40, so it may be in the left subtree. Look for a key that is not allowed.',
      '39 is smaller than 40, so it may be in the left subtree. Look for a key that is not allowed.',
      '',
    ],
    hints: ['Left subtree keys must be smaller.'],
    explain: '41 > 40, so it cannot be in the left subtree.',
  },
  {
    id: 'a3',
    lo: 'LO3',
    type: 'mcq',
    bloom: 'Understand',
    prompt: 'Where does a newly inserted key end up in a BST?',
    options: [
      'Always at the root',
      'Always as a new leaf',
      'In the middle, shifting other nodes down',
      'At the end of the in-order sequence',
    ],
    answer: 1,
    feedback: [
      'Only the first key into an empty tree becomes the root. Later keys walk down from it.',
      '',
      'Insert never moves existing nodes. It only fills an empty null link.',
      'The new key lands wherever its value belongs, not at the end of the sorted order.',
    ],
    hints: ['Insertion is an unsuccessful search plus a new node at the null spot.'],
    explain: 'Insert attaches the new node where the search fell off the tree: a leaf position.',
  },
  {
    id: 'a4',
    lo: 'LO4',
    type: 'mcq',
    bloom: 'Understand',
    prompt: 'The in-order traversal of a BST is 3, 8, 11, 17, 25. What can you conclude?',
    options: [
      '3 is the root',
      '25 is the root',
      'Nothing: in-order of a BST is always sorted, so the root cannot be determined',
      '11 must be a leaf',
    ],
    answer: 2,
    feedback: [
      'In-order of a BST is sorted, so 3 is first because it is smallest, not because it is the root.',
      '25 is last because it is the largest. In-order alone does not say which key is the root.',
      '',
      'Many shapes give this same sorted sequence, so you cannot tell where 11 sits.',
    ],
    hints: ['Many differently shaped BSTs have the same sorted in-order sequence.'],
    explain: 'Every BST with these keys has this in-order sequence, so it does not reveal the shape or the root.',
  },
  {
    id: 'a5',
    lo: 'LO5',
    type: 'mcq',
    bloom: 'Understand',
    prompt: 'During level-order traversal, node 12 is dequeued and has children 7 and 19. What happens next?',
    options: [
      '7 and 19 are visited immediately',
      '7 then 19 are added to the BACK of the queue',
      '19 then 7 are pushed onto a stack',
      'Nothing, children are ignored',
    ],
    answer: 1,
    feedback: [
      'Visiting the children at once would skip the rest of the current level.',
      '',
      'A stack is what depth first uses. Level-order needs first in, first out.',
      'Every node must be visited, so its children have to be remembered.',
    ],
    hints: ['Children must wait until the current level is finished.'],
    explain: 'The children are enqueued, left first, and visited after the nodes already waiting in the queue.',
  },
  {
    id: 'a6',
    lo: 'LO6',
    type: 'mcq',
    bloom: 'Analyse',
    prompt: 'Why can a BST built from already sorted input be slow to search?',
    options: [
      'Sorted data cannot be stored in a BST',
      'It becomes a tall chain with height n − 1, so search is O(n)',
      'In-order traversal stops working',
      'The root becomes too large',
    ],
    answer: 1,
    feedback: [
      'Any keys can be stored. The problem is the shape they produce.',
      '',
      'In-order still works on a chain. The problem is the height.',
      'The root is one node like any other. The problem is that every key ends up on one long path.',
    ],
    hints: ['Draw the tree after inserting 1, 2, 3, 4.'],
    explain: 'Each key goes to the right of the previous one: height n − 1, so search degrades to O(n).',
  },
  {
    id: 'a7',
    lo: 'LO6',
    type: 'mcq',
    bloom: 'Evaluate',
    prompt:
      'You need to save a BST to a file so that rebuilding it, by inserting in file order, gives the SAME shape. Which traversal should you write out?',
    options: ['In-order', 'Pre-order', 'Post-order', 'Any traversal works'],
    answer: 1,
    feedback: [
      'In-order writes the keys sorted, and inserting sorted keys builds a chain.',
      '',
      'Post-order writes the root last, so the first key inserted would be a leaf of the original.',
      'Different orders build different shapes. Each parent has to be inserted before its children.',
    ],
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
    bloom: 'Analyse',
    prompt: 'Roughly how many comparisons are needed to search a well balanced BST holding about 1 000 000 keys?',
    options: ['about 20', 'about 1 000', 'about 500 000', 'about 1 000 000'],
    answer: 0,
    feedback: [
      '',
      'That is the square root of a million. Each comparison halves the remaining keys, so it is about log₂ n.',
      'That is a linear search on average. A balanced BST rules out half the keys with each comparison.',
      'That is checking every key, the chain shaped worst case. A balanced tree needs only about log₂ n.',
    ],
    hints: ['What is log₂(1 000 000)?', '2¹⁰ ≈ 1 000, so 2²⁰ ≈ 1 000 000.'],
    explain: 'A balanced tree has height ≈ log₂ n ≈ 20.',
  },
]

let serial = 0
const freshId = (prefix: string) => `${prefix}-${++serial}`

/**
 * Up to four sorted options around the right number, so neighbours act as
 * distractors. `why` names the mistake that leads to each wrong number.
 */
function numberOptions(right: number, near: number[], far: number, why: (wrong: number) => string) {
  const values = [...new Set([right, ...near, far])].sort((a, b) => a - b).slice(0, 4)
  return {
    options: values.map(String),
    answer: values.indexOf(right),
    feedback: values.map((v) => (v === right ? '' : why(v))),
  }
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

export const GENERATORS: Record<OutcomeId, Generator> = {
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
        bloom: 'Remember',
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
        bloom: 'Remember',
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
      bloom: 'Understand',
      prompt: 'What is the height of this tree, counting edges?',
      ...numberOptions(h, [h + 1, Math.max(0, h - 1)], 7, (v) =>
        v === h + 1
          ? 'That counts the nodes on the longest path. Height counts the edges between them.'
          : v < h
            ? 'One edge short: count every edge from the root down to the deepest leaf.'
            : '7 is the number of nodes. Height is the number of edges on the longest root to leaf path.',
      ),
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
      bloom: 'Analyse',
      prompt: 'Is this a valid BST?',
      options: ['Yes', 'No'],
      answer: violation === null ? 0 : 1,
      feedback:
        violation === null
          ? [
              '',
              'Check each node against all its ancestors. Every key is on the correct side, so nothing breaks the rule.',
            ]
          : [`Look at ${violation}: it is on the wrong side of one of its ancestors, not only its parent.`, ''],
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
        bloom: 'Apply',
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
      bloom: 'Apply',
      prompt: `How many nodes are compared when searching for ${key}?`,
      ...numberOptions(path.length, [path.length + 1, Math.max(1, path.length - 1)], 7, (v) =>
        v === path.length + 1
          ? 'One too many: the search stops at the node that matches.'
          : v < path.length
            ? 'Count the node that matches as well: it is compared too.'
            : 'Search follows one path from the root; it never looks at every node.',
      ),
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
      bloom: 'Apply',
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
    bloom: 'Apply',
    prompt: 'Click the nodes in LEVEL-ORDER.',
    hints: ['Row by row, from the top; left to right in each row.'],
    explain: '',
  }),
  LO6: (rng) => {
    const n = 5 + Math.floor(rng() * 3)
    const keys = shuffle(
      Array.from({ length: 60 }, (_, i) => i + 1),
      rng,
    )
      .slice(0, n)
      .sort((a, b) => a - b)
    const chain = rng() < 0.5
    const order = chain ? keys : depthFirstOrder(balancedFrom(keys), 'pre')
    const h = height(fromKeys(order))
    const low = Math.floor(Math.log2(n))
    return {
      id: freshId('g6'),
      lo: 'LO6',
      type: 'mcq',
      bloom: 'Analyse',
      prompt: `These keys are inserted, in this order, into an empty BST: ${order.join(', ')}. What is the height of the tree, counting edges?`,
      ...numberOptions(h, [n - 1, low], n, (v) =>
        v === n
          ? `${n} is the number of keys. Height counts edges, and even a chain of ${n} keys has ${n - 1}.`
          : v === n - 1
            ? 'That is the height of a chain. Here a middle key goes in first, so the tree branches.'
            : 'That would be a balanced tree. Each key here is larger than the one before, so every key goes right.',
      ),
      hints: [
        'Draw the tree as you insert, one key at a time.',
        'Height counts the edges on the longest root to leaf path.',
      ],
      explain: chain
        ? `Each key is larger than the one before, so every key goes right: a chain of height ${h}. Searching it is O(n).`
        : `Middle keys go in first, so each level fills before the next: height ${h}, about log₂ n.`,
    }
  },
}

/** A fresh question for one outcome, from its generator, so a retry never repeats the last question. */
export function questionFor(lo: OutcomeId, rng: Rng): Question {
  return GENERATORS[lo](rng)
}

/** Two questions per outcome: one from the bank and one freshly generated. */
export function readinessSet(rng: Rng): Question[] {
  return (['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6'] as const).flatMap((lo) => [
    pick(
      BANK.filter((q) => q.lo === lo),
      rng,
    ),
    GENERATORS[lo](rng),
  ])
}
