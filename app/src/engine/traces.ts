import { insert, type Side, type Tree, type TreeNode } from './bst'
import { depthFirstOrder, levels } from './traversal'

export type TraversalKind = 'pre' | 'in' | 'post' | 'level'
export type TraceKind = TraversalKind | 'search' | 'insert'

export const TRAVERSALS: Record<TraversalKind, { label: string; rule: string; family: string }> = {
  pre: { label: 'Pre-order', rule: 'Node, Left, Right', family: 'Depth first' },
  in: { label: 'In-order', rule: 'Left, Node, Right', family: 'Depth first' },
  post: { label: 'Post-order', rule: 'Left, Right, Node', family: 'Depth first' },
  level: { label: 'Level-order', rule: 'Level by level, left to right', family: 'Breadth first' },
}

export const TRACE_TITLES: Record<TraceKind, string> = {
  pre: 'Pre-order traversal',
  in: 'In-order traversal',
  post: 'Post-order traversal',
  level: 'Level-order traversal',
  search: 'BST search',
  insert: 'BST insertion',
}

export const PSEUDOCODE: Record<TraceKind, string[]> = {
  pre: [
    'preorder(node):',
    '  if node is null: return',
    '  visit(node)',
    '  preorder(node.left)',
    '  preorder(node.right)',
  ],
  in: ['inorder(node):', '  if node is null: return', '  inorder(node.left)', '  visit(node)', '  inorder(node.right)'],
  post: [
    'postorder(node):',
    '  if node is null: return',
    '  postorder(node.left)',
    '  postorder(node.right)',
    '  visit(node)',
  ],
  level: [
    'levelOrder(root):',
    '  queue ← [root]',
    '  while queue is not empty:',
    '    node ← queue.dequeue()',
    '    visit(node)',
    '    if node.left: queue.enqueue(node.left)',
    '    if node.right: queue.enqueue(node.right)',
  ],
  search: [
    'search(node, key):',
    '  if node is null: return NOT FOUND',
    '  if key == node.key: return FOUND',
    '  if key < node.key: return search(node.left, key)',
    '  else: return search(node.right, key)',
  ],
  insert: [
    'insert(node, key):',
    '  if node is null: return new Node(key)',
    '  if key < node.key: node.left ← insert(node.left, key)',
    '  else: node.right ← insert(node.right, key)',
    '  return node',
  ],
}

export interface TraceStep {
  current: number | null
  line: number
  text: string
  output: number[]
  stack: number[]
  queue: number[]
  path: number[]
  done?: boolean
  found?: boolean
  ghost?: { parent: number | null; side: Side | null; key: number }
  inserted?: number
}

const blank = { output: [], stack: [], queue: [], path: [] }

export function traversalOrder(root: Tree, kind: TraversalKind): number[] {
  return kind === 'level' ? levels(root).flat() : depthFirstOrder(root, kind)
}

const LINES = {
  pre: { check: 1, visit: 2, left: 3, right: 4 },
  in: { check: 1, left: 2, visit: 3, right: 4 },
  post: { check: 1, left: 2, right: 3, visit: 4 },
}

function levelTrace(root: TreeNode): TraceStep[] {
  const steps: TraceStep[] = []
  const output: number[] = []
  const queue: TreeNode[] = [root]
  const record = (current: number | null, line: number, text: string) =>
    steps.push({ ...blank, current, line, text, output: [...output], queue: queue.map((n) => n.key) })

  record(null, 1, `Start: put the root (${root.key}) in the queue.`)
  while (queue.length) {
    const n = queue.shift()!
    record(n.key, 3, `Dequeue ${n.key} from the front of the queue.`)
    output.push(n.key)
    record(n.key, 4, `Visit ${n.key}. Output so far: ${output.join(', ')}.`)
    if (n.left) {
      queue.push(n.left)
      record(n.key, 5, `${n.key} has a left child (${n.left.key}), so add it to the back of the queue.`)
    }
    if (n.right) {
      queue.push(n.right)
      record(n.key, 6, `${n.key} has a right child (${n.right.key}), so add it to the back of the queue.`)
    }
    if (!n.left && !n.right) {
      record(n.key, 2, `${n.key} is a leaf, nothing to enqueue. Queue: [${queue.map((q) => q.key).join(', ')}].`)
    }
  }
  steps.push({
    ...blank,
    current: null,
    line: 2,
    text: `The queue is empty, so we are done. Level-order: ${output.join(', ')}.`,
    output: [...output],
    done: true,
  })
  return steps
}

function depthFirstTrace(root: TreeNode, kind: 'pre' | 'in' | 'post'): TraceStep[] {
  const steps: TraceStep[] = []
  const lines = LINES[kind]
  const output: number[] = []
  const stack: number[] = []
  const record = (current: number, line: number, text: string) =>
    steps.push({ ...blank, current, line, text, output: [...output], stack: [...stack] })

  const call = (n: TreeNode) => {
    stack.push(n.key)
    record(n.key, lines.check, `Call ${kind}order(${n.key}). It is not null, so continue.`)
    const visit = () => {
      output.push(n.key)
      record(n.key, lines.visit, `Visit ${n.key}. Output so far: ${output.join(', ')}.`)
    }
    const descend = (side: Side) => {
      const child = n[side]
      if (child) {
        record(n.key, lines[side], `Go to the ${side} subtree of ${n.key} (rooted at ${child.key}).`)
        call(child)
        record(n.key, lines[side], `Back at ${n.key}: its ${side} subtree is finished.`)
      } else {
        record(n.key, lines[side], `${n.key} has no ${side} child (null), so there is nothing to do.`)
      }
    }
    if (kind === 'pre') visit()
    descend('left')
    if (kind === 'in') visit()
    descend('right')
    if (kind === 'post') visit()
    stack.pop()
    const caller = stack.length ? ` to ${stack[stack.length - 1]}` : ''
    record(n.key, 0, `${kind}order(${n.key}) returns${caller}.`)
  }

  call(root)
  steps.push({
    ...blank,
    current: null,
    line: 0,
    text: `Done. ${TRAVERSALS[kind].label}: ${output.join(', ')}.`,
    output: [...output],
    done: true,
  })
  return steps
}

export function traversalTrace(root: Tree, kind: TraversalKind): TraceStep[] {
  if (root === null) {
    return [{ ...blank, current: null, line: 0, text: 'The tree is empty, so there is nothing to visit.', done: true }]
  }
  return kind === 'level' ? levelTrace(root) : depthFirstTrace(root, kind)
}

export function searchTrace(root: Tree, key: number): TraceStep[] {
  const steps: TraceStep[] = []
  const path: number[] = []
  let n = root
  while (n !== null) {
    path.push(n.key)
    steps.push({ ...blank, current: n.key, path: [...path], line: 0, text: `Look at node ${n.key}.` })
    if (key === n.key) {
      const s = path.length > 1 ? 's' : ''
      steps.push({
        ...blank,
        current: n.key,
        path: [...path],
        line: 2,
        text: `${key} == ${n.key}: found after ${path.length} comparison${s}.`,
        done: true,
        found: true,
      })
      return steps
    }
    const side: Side = key < n.key ? 'left' : 'right'
    steps.push({
      ...blank,
      current: n.key,
      path: [...path],
      line: side === 'left' ? 3 : 4,
      text: `${key} ${side === 'left' ? '<' : '>'} ${n.key}, so the key can only be in the ${side.toUpperCase()} subtree.`,
    })
    n = n[side]
  }
  steps.push({
    ...blank,
    current: null,
    path: [...path],
    line: 1,
    text:
      root === null
        ? `The tree is empty, so ${key} is not found.`
        : `We reached a null link: ${key} is not found (${path.length} comparisons).`,
    done: true,
    found: false,
  })
  return steps
}

export function insertTrace(root: Tree, key: number): { steps: TraceStep[]; result: Tree } {
  const result = insert(root, key)
  if (root === null) {
    return {
      result,
      steps: [
        {
          ...blank,
          current: null,
          line: 1,
          text: `The tree is empty, so ${key} becomes the root.`,
          ghost: { parent: null, side: null, key },
        },
        { ...blank, current: key, path: [key], line: 4, text: `Inserted ${key}.`, done: true, inserted: key },
      ],
    }
  }
  const steps: TraceStep[] = []
  const path: number[] = []
  let n: TreeNode = root
  for (;;) {
    path.push(n.key)
    if (key === n.key) {
      steps.push({
        ...blank,
        current: n.key,
        path: [...path],
        line: 0,
        text: `${key} is already in the tree. This app stores distinct keys, so nothing is inserted.`,
        done: true,
      })
      return { steps, result }
    }
    const side: Side = key < n.key ? 'left' : 'right'
    steps.push({
      ...blank,
      current: n.key,
      path: [...path],
      line: side === 'left' ? 2 : 3,
      text: `${key} ${side === 'left' ? '<' : '>'} ${n.key}: go ${side.toUpperCase()}.`,
    })
    const next = n[side]
    if (next === null) {
      steps.push({
        ...blank,
        current: n.key,
        path: [...path],
        line: 1,
        text: `The ${side} child of ${n.key} is null, so this is where ${key} goes.`,
        ghost: { parent: n.key, side, key },
      })
      steps.push({
        ...blank,
        current: key,
        path: [...path, key],
        line: 4,
        text: `Inserted ${key} as the ${side} child of ${n.key}. New nodes are always leaves.`,
        done: true,
        inserted: key,
      })
      return { steps, result }
    }
    n = next
  }
}
