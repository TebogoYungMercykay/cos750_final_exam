import { insert, type Side, type Tree, type TreeNode } from './bst'
import { depthFirstOrder, levels, makeFrontier, type FrontierKind } from './traversal'

export type TraversalKind = 'pre' | 'in' | 'post' | 'level'
export type FrontierTraceKind = 'bfs' | 'dfs'
export type TraceKind = TraversalKind | FrontierTraceKind | 'search' | 'insert'

export const TRAVERSALS: Record<TraversalKind, { label: string; rule: string; family: string }> = {
  pre: { label: 'Pre-order', rule: 'Node, Left, Right', family: 'Depth first' },
  in: { label: 'In-order', rule: 'Left, Node, Right', family: 'Depth first' },
  post: { label: 'Post-order', rule: 'Left, Right, Node', family: 'Depth first' },
  level: { label: 'Level-order', rule: 'Level by level, left to right', family: 'Breadth first' },
}

export const FRONTIER_OF: Record<FrontierTraceKind, FrontierKind> = { bfs: 'queue', dfs: 'stack' }

export const TRACE_TITLES: Record<TraceKind, string> = {
  pre: 'Pre-order traversal',
  in: 'In-order traversal',
  post: 'Post-order traversal',
  level: 'Level-order traversal',
  bfs: 'Tree search with a queue: breadth first',
  dfs: 'Tree search with a stack: depth first',
  search: 'BST search',
  insert: 'BST insertion',
}

const recursive = (name: string, body: string[]) => [
  `void ${name}(Node node) {`,
  '  if (node == null) return;',
  ...body,
  '}',
]

/** One loop for both walks: `frontier` is any class implementing FRONTIER_INTERFACE. */
const FRONTIER_LOOP = [
  'void search(Node root, Frontier frontier) {',
  '  frontier.add(root);',
  '  while (!frontier.isEmpty()) {',
  '    Node node = frontier.remove();',
  '    visit(node);',
  '    frontier.addChildren(node);',
  '  }',
  '}',
]

/** The interface the frontier loop is written against; a queue class and a stack class implement it. */
export const FRONTIER_INTERFACE = [
  'interface Frontier {',
  '  void add(Node node);',
  '  Node remove();               // queue: the front; stack: the top',
  '  boolean isEmpty();',
  '  void addChildren(Node node); // stack: right child first',
  '}',
]

/**
 * Java, the language of COS212, written as the shortest code that does
 * exactly what the trace narrates. Line 0 is always the signature, which no
 * step highlights: a step always points at the line doing the work.
 */
export const CODE: Record<TraceKind, string[]> = {
  pre: recursive('preorder', ['  visit(node);', '  preorder(node.left);', '  preorder(node.right);']),
  in: recursive('inorder', ['  inorder(node.left);', '  visit(node);', '  inorder(node.right);']),
  post: recursive('postorder', ['  postorder(node.left);', '  postorder(node.right);', '  visit(node);']),
  level: [
    'void levelOrder(Node root) {',
    '  Queue<Node> queue = new ArrayDeque<>();',
    '  queue.add(root);',
    '  while (!queue.isEmpty()) {',
    '    Node node = queue.remove();',
    '    visit(node);',
    '    if (node.left != null) queue.add(node.left);',
    '    if (node.right != null) queue.add(node.right);',
    '  }',
    '}',
  ],
  bfs: FRONTIER_LOOP,
  dfs: FRONTIER_LOOP,
  search: [
    'Node search(Node node, int key) {',
    '  if (node == null) return null;',
    '  if (key == node.key) return node;',
    '  if (key < node.key) return search(node.left, key);',
    '  return search(node.right, key);',
    '}',
  ],
  insert: [
    'Node insert(Node node, int key) {',
    '  if (node == null) return new Node(key);',
    '  if (key < node.key) node.left = insert(node.left, key);',
    '  else if (key > node.key) node.right = insert(node.right, key);',
    '  return node;',
    '}',
  ],
}

const SIGNATURE = 'Starts the method.'
const CLOSE = 'This call is finished and returns to the call that made it.'

const recursiveNotes = (visitAt: number, visit: string): string[] => {
  const notes = [
    SIGNATURE,
    'An empty subtree has nothing to visit, so this call ends at once.',
    'Walk the whole left subtree.',
    'Then walk the whole right subtree.',
  ]
  notes.splice(visitAt, 0, visit)
  return [...notes, CLOSE]
}

const frontierNotes = (name: string, out: string, add: string) => [
  SIGNATURE,
  `The root is the only node known at the start, so it goes into the ${name}.`,
  `Keep going while any node is still waiting in the ${name}.`,
  `Take the next node out. A ${name} gives back ${out}.`,
  'Visit the node: here, that means print its key.',
  add,
  'End of one round of the loop.',
  `The ${name} is empty: every node has been visited.`,
]

/**
 * What each line does to the tree, shown beside the highlighted line in
 * guided mode. The learner reads Java, so the notes explain the tree idea and
 * never the syntax.
 */
export const CODE_NOTES: Record<TraceKind, string[]> = {
  pre: recursiveNotes(2, 'Pre-order visits the node first, before either subtree.'),
  in: recursiveNotes(3, 'In-order visits the node between its subtrees: after the left, before the right.'),
  post: recursiveNotes(4, 'Post-order visits the node last, after both subtrees.'),
  level: [
    SIGNATURE,
    'The queue holds nodes that are found but not yet visited, in the order they were found.',
    'The root is the first node waiting.',
    'Keep going while any node is still waiting.',
    'Take the node that has waited longest: the front of the queue.',
    'Visit the node: here, that means print its key.',
    'A left child joins the back of the queue, one level further down.',
    'A right child joins the back of the queue too.',
    'End of one round of the loop.',
    'The queue is empty: every node has been visited.',
  ],
  bfs: frontierNotes(
    'queue',
    'the node that has waited longest',
    'Add the children to the back of the queue: left first, then right.',
  ),
  dfs: frontierNotes(
    'stack',
    'the node added most recently',
    'Push the children right first, then left, so the left child is on top and comes out next.',
  ),
  search: [
    SIGNATURE,
    'A null link means the search fell off the tree: the key is not here.',
    'This node holds the key: found.',
    'A smaller key can only be in the left subtree, so the right subtree is never looked at.',
    'Otherwise the key is larger, so it can only be in the right subtree.',
    CLOSE,
  ],
  insert: [
    SIGNATURE,
    'An empty spot: the new node goes exactly here.',
    'A smaller key belongs somewhere in the left subtree; the returned subtree is linked back in.',
    'A larger key belongs somewhere in the right subtree; the returned subtree is linked back in.',
    'Hand this subtree back to the caller. An equal key changes nothing, so duplicates are never stored.',
    CLOSE,
  ],
}

export interface TraceStep {
  current: number | null
  /** Index into CODE for this kind; never 0, the signature. */
  line: number
  text: string
  output: number[]
  /** The call stack, bottom first. */
  stack: number[]
  /** Nodes waiting in the queue or frontier, next one out first. */
  queue: number[]
  path: number[]
  /** A check that changes nothing on screen. Guided mode shows it; standard mode skips it. */
  detail?: boolean
  /** A few words about the current node, drawn beside it on the tree in guided mode. */
  note?: string
  /** Why the step happens, for a learner meeting the idea for the first time. Shown in guided mode. */
  why?: string
  done?: boolean
  found?: boolean
  ghost?: { parent: number | null; side: Side | null; key: number }
  inserted?: number
}

const blank = { output: [], stack: [], queue: [], path: [] }
const list = (keys: readonly number[]) => (keys.length ? keys.join(', ') : 'empty')
const upper = (s: string) => s[0].toUpperCase() + s.slice(1)

export function traversalOrder(root: Tree, kind: TraversalKind): number[] {
  return kind === 'level' ? levels(root).flat() : depthFirstOrder(root, kind)
}

const LINES = {
  pre: { check: 1, visit: 2, left: 3, right: 4, end: 5 },
  in: { check: 1, left: 2, visit: 3, right: 4, end: 5 },
  post: { check: 1, left: 2, right: 3, visit: 4, end: 5 },
}

const visitWhy = (kind: 'pre' | 'in' | 'post', key: number) =>
  ({
    pre: `Pre-order visits ${key} as soon as its call starts, before either of its subtrees.`,
    in: `The left subtree of ${key} is finished, so in-order visits ${key} before starting on its right subtree.`,
    post: `Both subtrees of ${key} are finished, so post-order visits ${key} now.`,
  })[kind]

function levelTrace(root: TreeNode): TraceStep[] {
  const steps: TraceStep[] = []
  const output: number[] = []
  const queue: TreeNode[] = [root]
  const record = (current: number | null, line: number, text: string, extra: Partial<TraceStep> = {}) =>
    steps.push({ ...blank, current, line, text, output: [...output], queue: queue.map((n) => n.key), ...extra })

  record(null, 2, `Start: put the root (${root.key}) in the queue.`, {
    why: 'The queue holds the nodes waiting to be visited, in the order they were found.',
  })
  while (queue.length) {
    const n = queue.shift()!
    record(n.key, 4, `Take ${n.key} from the front of the queue. Queue: ${list(queue.map((q) => q.key))}.`, {
      note: 'front of queue',
      why: `${n.key} has waited longest, so it comes out first: first in, first out.`,
    })
    output.push(n.key)
    record(n.key, 5, `Visit ${n.key}. Output so far: ${output.join(', ')}.`, {
      note: `visit ${output.length}`,
      why: 'Nodes are visited in the order they leave the queue, which is row by row, left to right.',
    })
    for (const side of ['left', 'right'] as const) {
      const child = n[side]
      const line = side === 'left' ? 6 : 7
      if (child) {
        queue.push(child)
        record(n.key, line, `${n.key} has a ${side} child (${child.key}), so add it to the back of the queue.`, {
          note: `add ${child.key}`,
          why: `${child.key} is one level further down, so it waits behind every node already in the queue.`,
        })
      } else {
        const leaf = side === 'right' && n.left === null
        record(
          n.key,
          line,
          leaf
            ? `${n.key} has no children: it is a leaf, so nothing joins the queue.`
            : `${n.key} has no ${side} child.`,
          { detail: true, note: `${side} is null` },
        )
      }
    }
  }
  record(null, 3, `The queue is empty, so the loop stops. Level-order: ${output.join(', ')}.`, { done: true })
  return steps
}

function depthFirstTrace(root: TreeNode, kind: 'pre' | 'in' | 'post'): TraceStep[] {
  const steps: TraceStep[] = []
  const lines = LINES[kind]
  const output: number[] = []
  const stack: number[] = []
  const record = (current: number, line: number, text: string, extra: Partial<TraceStep> = {}) =>
    steps.push({ ...blank, current, line, text, output: [...output], stack: [...stack], ...extra })

  const call = (n: TreeNode) => {
    const caller = stack.at(-1)
    stack.push(n.key)
    record(n.key, lines.check, `Call ${kind}order(${n.key}). It is not null, so continue.`, {
      note: 'running',
      why:
        caller === undefined
          ? `The walk starts with one call on the root. It goes on the call stack, which keeps track of unfinished calls.`
          : `The call for ${n.key} goes on top of the call stack. The call for ${caller} waits underneath until it returns.`,
    })
    const visit = () => {
      output.push(n.key)
      record(n.key, lines.visit, `Visit ${n.key}. Output so far: ${output.join(', ')}.`, {
        note: `visit ${output.length}`,
        why: visitWhy(kind, n.key),
      })
    }
    const descend = (side: Side) => {
      const child = n[side]
      if (child) {
        record(n.key, lines[side], `Go to the ${side} subtree of ${n.key} (rooted at ${child.key}).`, {
          detail: true,
          note: `go ${side}`,
        })
        call(child)
        record(n.key, lines[side], `Back at ${n.key}: its ${side} subtree is finished.`, {
          detail: true,
          note: `${side} done`,
        })
      } else {
        record(n.key, lines[side], `${n.key} has no ${side} child (null), so there is nothing to do.`, {
          detail: true,
          note: `${side} is null`,
        })
      }
    }
    if (kind === 'pre') visit()
    descend('left')
    if (kind === 'in') visit()
    descend('right')
    if (kind === 'post') visit()
    stack.pop()
    const back = stack.at(-1)
    record(n.key, lines.end, `${kind}order(${n.key}) returns${back === undefined ? '' : ` to ${back}`}.`, {
      note: 'return',
      why:
        back === undefined
          ? 'The first call has returned, so the whole tree has been walked.'
          : `Everything below ${n.key} is done, so its call comes off the stack and ${back} carries on where it stopped.`,
    })
  }

  call(root)
  steps.push({
    ...blank,
    current: null,
    line: lines.end,
    text: `Done. ${TRAVERSALS[kind].label}: ${output.join(', ')}.`,
    output: [...output],
    done: true,
  })
  return steps
}

export function traversalTrace(root: Tree, kind: TraversalKind): TraceStep[] {
  if (root === null) {
    return [{ ...blank, current: null, line: 1, text: 'The tree is empty, so there is nothing to visit.', done: true }]
  }
  return kind === 'level' ? levelTrace(root) : depthFirstTrace(root, kind)
}

/**
 * Uninformed tree search as one loop over the engine's own frontier objects:
 * the queue or the stack alone decides whether the walk is breadth first or
 * depth first.
 */
export function frontierTrace(root: Tree, kind: FrontierTraceKind): TraceStep[] {
  const fk = FRONTIER_OF[kind]
  const frontier = makeFrontier(fk)
  const steps: TraceStep[] = []
  const output: number[] = []
  const record = (current: number | null, line: number, text: string, extra: Partial<TraceStep> = {}) =>
    steps.push({ ...blank, current, line, text, output: [...output], queue: frontier.keys(), ...extra })

  if (root === null) {
    record(null, 2, 'The tree is empty, so there is nothing to visit.', { done: true })
    return steps
  }
  frontier.addChildren([root])
  record(null, 1, `Start: add the root (${root.key}) to the ${fk}.`, {
    why: 'The frontier holds nodes that are found but not yet visited. At the start only the root is known.',
  })
  while (!frontier.isEmpty()) {
    const n = frontier.remove()
    record(n.key, 3, `Take ${n.key} from the ${fk === 'queue' ? 'front of the queue' : 'top of the stack'}.`, {
      note: fk === 'queue' ? 'front of queue' : 'top of stack',
      why:
        fk === 'queue'
          ? `A queue is first in, first out: ${n.key} has waited longest.`
          : `A stack is last in, first out: ${n.key} was added most recently.`,
    })
    output.push(n.key)
    record(n.key, 4, `Visit ${n.key}. Visit order so far: ${output.join(', ')}.`, {
      note: `visit ${output.length}`,
      why: `Nodes are visited in the order they leave the ${fk}, so the ${fk} alone decides the order.`,
    })
    const children = [n.left, n.right].filter((c) => c !== null)
    frontier.addChildren(children)
    const waiting = `${upper(fk)}: ${list(frontier.keys())}.`
    if (children.length === 0) {
      record(n.key, 5, `${n.key} is a leaf, so no children are added. ${waiting}`, { detail: true, note: 'leaf' })
    } else if (children.length === 1) {
      record(n.key, 5, `Add ${n.key}'s only child, ${children[0].key}, to the ${fk}. ${waiting}`, {
        note: `add ${children[0].key}`,
        why:
          fk === 'queue'
            ? `${children[0].key} waits behind every node already in the queue.`
            : `${children[0].key} goes on top of the stack, so it comes out next.`,
      })
    } else if (fk === 'queue') {
      const [l, r] = children
      record(
        n.key,
        5,
        `Add ${n.key}'s children to the back of the queue, left ${l.key} then right ${r.key}. ${waiting}`,
        {
          note: `add ${l.key}, ${r.key}`,
          why: 'Children wait behind every node already in the queue, so the walk finishes a level before it starts the next.',
        },
      )
    } else {
      const [l, r] = children
      record(
        n.key,
        5,
        `Push ${n.key}'s children, right ${r.key} first, then left ${l.key}, so ${l.key} is on top. ${waiting}`,
        {
          note: `push ${r.key}, ${l.key}`,
          why: 'The newest node comes out next, so the walk dives down the left side before it comes back for the right.',
        },
      )
    }
  }
  record(null, 2, `The ${fk} is empty, so the loop stops. Visit order: ${output.join(', ')}.`, { done: true })
  return steps
}

export function searchTrace(root: Tree, key: number): TraceStep[] {
  const steps: TraceStep[] = []
  const path: number[] = []
  let n = root
  while (n !== null) {
    path.push(n.key)
    steps.push({
      ...blank,
      current: n.key,
      path: [...path],
      line: 1,
      text: `Look at node ${n.key}. It is not null, so compare.`,
      detail: true,
      note: `${key}?`,
    })
    if (key === n.key) {
      const s = path.length > 1 ? 's' : ''
      steps.push({
        ...blank,
        current: n.key,
        path: [...path],
        line: 2,
        text: `${key} == ${n.key}: found after ${path.length} comparison${s}.`,
        note: 'found',
        why:
          path.length > 1
            ? `Each comparison ruled out a whole subtree, so only ${path.length} nodes were checked.`
            : `${key} is at the root, so one comparison is enough.`,
        done: true,
        found: true,
      })
      return steps
    }
    steps.push({
      ...blank,
      current: n.key,
      path: [...path],
      line: 2,
      text: `${key} is not ${n.key}, so keep searching.`,
      detail: true,
      note: `${key} ≠ ${n.key}`,
    })
    const side: Side = key < n.key ? 'left' : 'right'
    const other = side === 'left' ? 'right' : 'left'
    steps.push({
      ...blank,
      current: n.key,
      path: [...path],
      line: side === 'left' ? 3 : 4,
      text: `${key} ${side === 'left' ? '<' : '>'} ${n.key}, so the key can only be in the ${side.toUpperCase()} subtree.`,
      note: `${key} ${side === 'left' ? '<' : '>'} ${n.key}, go ${side}`,
      why: `Every key in the ${other} subtree of ${n.key} is ${side === 'left' ? 'bigger' : 'smaller'} than ${n.key}, so ${key} cannot be there. That whole subtree is skipped.`,
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
    why:
      root === null
        ? undefined
        : `If ${key} were in the tree, the BST rule says it would have to be exactly where this null link is.`,
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
          why: 'With no nodes yet, the first key becomes the root, and the tree is a reference to it.',
          ghost: { parent: null, side: null, key },
        },
        {
          ...blank,
          current: key,
          path: [key],
          line: 1,
          text: `Inserted ${key}. The tree now has one node.`,
          note: 'new root',
          done: true,
          inserted: key,
        },
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
        line: 4,
        text: `${key} is already in the tree. Neither branch runs, so nothing is inserted.`,
        note: 'already here',
        why: 'A BST here stores each key once, so an equal key leaves the tree unchanged.',
        done: true,
      })
      return { steps, result }
    }
    const side: Side = key < n.key ? 'left' : 'right'
    const line = side === 'left' ? 2 : 3
    steps.push({
      ...blank,
      current: n.key,
      path: [...path],
      line,
      text: `${key} ${side === 'left' ? '<' : '>'} ${n.key}: go ${side.toUpperCase()}.`,
      note: `${key} ${side === 'left' ? '<' : '>'} ${n.key}, go ${side}`,
      why:
        path.length === 1
          ? 'Insert follows exactly the path a search for the key would take, so the key can be found again later.'
          : `${key} is ${side === 'left' ? 'smaller' : 'bigger'} than ${n.key}, so it must end up in ${n.key}'s ${side} subtree to keep the BST rule.`,
    })
    const next = n[side]
    if (next === null) {
      steps.push({
        ...blank,
        current: n.key,
        path: [...path],
        line: 1,
        text: `The ${side} child of ${n.key} is null, so this is where ${key} goes.`,
        note: `${side} is null`,
        why: `This null link is exactly where a search for ${key} would end, so the new node goes here.`,
        ghost: { parent: n.key, side, key },
      })
      steps.push({
        ...blank,
        current: key,
        path: [...path, key],
        line,
        text: `Inserted ${key} as the ${side} child of ${n.key}. New nodes are always leaves.`,
        note: 'new leaf',
        why: `The call returns the new node, and ${n.key}.${side} now refers to it. Every call above returns its node unchanged.`,
        done: true,
        inserted: key,
      })
      return { steps, result }
    }
    n = next
  }
}
