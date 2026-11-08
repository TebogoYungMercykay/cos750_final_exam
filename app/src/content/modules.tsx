import { Gauge, Layers, Network, Rows3, Scale, Search } from 'lucide-react'
import { findNode, fromKeys, fromSpec, height, leaves, nullLinks, searchPath, type Tree } from '../engine/bst'
import { levels } from '../engine/traversal'
import type { Module, ModuleId, Outcome, OutcomeId, Part } from './types'

export const OUTCOMES: Record<OutcomeId, Outcome> = {
  LO1: {
    short: 'Tree vocabulary',
    text: 'Identify the parts of a tree: root, parent, child, leaf, edge, subtree, level and height.',
    bloom: ['Remember', 'Understand'],
    module: 'm1',
  },
  LO2: {
    short: 'The BST rule',
    text: 'Explain the BST ordering property and decide whether a binary tree is a BST.',
    bloom: ['Understand', 'Apply', 'Analyse'],
    module: 'm2',
  },
  LO3: {
    short: 'Search and insert',
    text: 'Trace BST search and insertion step by step.',
    bloom: ['Understand', 'Apply'],
    module: 'm3',
  },
  LO4: {
    short: 'Tree search: depth first',
    text: 'Trace depth first tree search with a stack, and produce the pre-order, in-order and post-order walks of a binary tree.',
    bloom: ['Understand', 'Apply'],
    module: 'm4',
  },
  LO5: {
    short: 'Tree search: breadth first',
    text: 'Trace breadth first tree search with a queue, produce a level-order walk, and explain why the queue gives level order.',
    bloom: ['Understand', 'Apply'],
    module: 'm5',
  },
  LO6: {
    short: 'Shape and efficiency',
    text: 'Compare tree search with BST search, relate tree height to their cost, and choose a suitable walk for a task.',
    bloom: ['Analyse', 'Evaluate'],
    module: 'm6',
  },
}

export const OUTCOME_IDS = Object.keys(OUTCOMES) as OutcomeId[]

/**
 * The app's one data structure and one algorithm, as the examination
 * specification asks, with where CS2023 lists each as CS Core. Every lesson
 * belongs to one part.
 */
export const PARTS: Record<Part, { name: string; topic: string; lessons: string }> = {
  structure: { name: 'The data structure', topic: 'The binary search tree', lessons: 'Lessons 1 to 3' },
  algorithm: {
    name: 'The algorithm',
    topic: 'Tree search, depth first and breadth first',
    lessons: 'Lessons 4 and 5',
  },
  both: { name: 'Both together', topic: 'How the shape of the tree sets the cost of a search', lessons: 'Lesson 6' },
}

export const CS2023 = {
  structure: 'CS2023 AL-Foundational 9a: binary, n-ary and search trees',
  algorithm: 'CS2023 AL-Foundational 11c: uninformed depth/breadth-first tree search',
}

export const TREES = {
  balanced: fromKeys([50, 30, 70, 20, 40, 60, 80]),
  uneven: fromKeys([40, 20, 60, 10, 30, 50, 70, 25]),
  small: fromKeys([8, 3, 10, 1, 6, 14]),
  lecture: fromKeys([15, 9, 23, 4, 12, 20, 27]),
  wide: fromKeys([30, 18, 45, 10, 22, 40, 50, 35]),
}

/** Labels the root, one parent and every leaf, all read from the tree so a label can never be wrong. */
function anatomy(tree: Tree, parent: number): Partial<Record<number, string>> {
  const p = findNode(tree, parent)
  const children = [p?.left?.key, p?.right?.key].filter((k) => k !== undefined)
  return {
    ...Object.fromEntries(leaves(tree).map((k) => [k, 'leaf'])),
    [parent]: `parent of ${children.join(' and ')}`,
    ...(tree && { [tree.key]: 'root' }),
  }
}

const BALANCED_7 = fromKeys([4, 2, 6, 1, 3, 5, 7])
const FIRST_TREE = TREES.small
const CODE_TREE = fromKeys([8, 3, 10, 6])
/** Deliberately not the quick check's tree, so this figure does not give away its answer. */
const LEVEL_TREE = fromKeys([50, 30, 70, 20, 40, 80, 35])
const DEEPEST = levels(LEVEL_TREE).at(-1)![0]

export const MODULES: Module[] = [
  {
    id: 'm1',
    lo: 'LO1',
    part: 'structure',
    icon: Network,
    minutes: 10,
    title: 'Trees 101',
    tagline: 'The vocabulary you need before the lecture.',
    hook: (
      <>
        <p>
          The folders on your laptop, a family tree, the bracket of a soccer tournament, the menu of a website: all of
          these are <strong>trees</strong>.
        </p>
        <p>
          Computer scientists use the same shape to store data so that it can be found quickly. Before we can make a
          tree <em>search</em>, we need the words to talk about it.
        </p>
      </>
    ),
    recall: (
      <p>
        From your OOP modules you know objects whose fields refer to other objects, and that a reference can be{' '}
        <code>null</code>. A tree is built from exactly that.
      </p>
    ),
    sections: [
      {
        type: 'figure',
        title: 'What is a tree?',
        tree: FIRST_TREE,
        labels: anatomy(FIRST_TREE, 3),
        caption: `The root is ${FIRST_TREE!.key}. The leaves are ${leaves(FIRST_TREE).join(', ')}.`,
        body: (
          <>
            <p>
              A <strong>tree</strong> is a set of <strong>nodes</strong> (the circles) joined by <strong>edges</strong>{' '}
              (the lines).
            </p>
            <ul>
              <li>
                One node sits at the top: the <strong>root</strong>.
              </li>
              <li>
                Every other node has exactly one <strong>parent</strong> (the node directly above it).
              </li>
              <li>
                The nodes directly below a node are its <strong>children</strong>.
              </li>
              <li>
                A node with no children is a <strong>leaf</strong>.
              </li>
              <li>There are no loops: you can never follow edges downward and come back to where you started.</li>
            </ul>
            <p className="aside">Computer science draws trees with the root at the top and the leaves at the bottom.</p>
          </>
        ),
      },
      {
        type: 'explore',
        title: 'Explore: select any node',
        tree: TREES.uneven,
        caption:
          'Click a node, or Tab to it and press Enter, to see its role. Try the root, a leaf and a node in the middle.',
      },
      {
        type: 'figure',
        title: 'Trees in code',
        tree: CODE_TREE,
        labels: { [CODE_TREE!.key]: 'root' },
        nulls: true,
        caption: `Four Node objects and ${nullLinks(CODE_TREE).length} null links: ${nullLinks(CODE_TREE).join(', ')}.`,
        body: (
          <>
            <p>You already know everything a tree needs from OOP. A node is an object of one small class:</p>
            <pre className="code code-block">
              {`class Node {
  int key;
  Node left;   // left child, or null
  Node right;  // right child, or null

  Node(int key) { this.key = key; }
}`}
            </pre>
            <ul>
              <li>
                Each circle is one <code>Node</code> object.
              </li>
              <li>Each edge is a reference from a parent to a child.</li>
              <li>
                A missing child is simply <code>null</code>, drawn here as a dashed stub.
              </li>
              <li>
                The tree itself is a single reference, <code>Node root</code>. An empty tree is{' '}
                <code>root == null</code>.
              </li>
            </ul>
            <p className="aside">
              Because every child is itself the root of a smaller tree, most tree code is recursive: do something with
              this node, then call the same method on <code>node.left</code> and <code>node.right</code>.
            </p>
          </>
        ),
      },
      {
        type: 'figure',
        title: 'Binary trees, levels and height',
        tree: LEVEL_TREE,
        ruler: true,
        labels: { [DEEPEST]: 'deepest' },
        caption: `Height ${height(LEVEL_TREE)}: the deepest node, ${DEEPEST}, is on level ${height(LEVEL_TREE)}.`,
        body: (
          <>
            <p>
              In a <strong>binary tree</strong> every node has <em>at most two</em> children, called the{' '}
              <strong>left child</strong> and the <strong>right child</strong>.
            </p>
            <p>
              Any node together with everything below it forms a <strong>subtree</strong>. So each node has a{' '}
              <em>left subtree</em> and a <em>right subtree</em> (either may be empty).
            </p>
            <ul>
              <li>
                The <strong>level</strong> of a node is the number of nodes on the path from the root down to it. The
                root is on level 1, its children on level 2, and so on.
              </li>
              <li>
                The <strong>height</strong> of a tree is its number of levels: the level of its deepest node. A single
                node has height 1, and an empty tree height 0.
              </li>
            </ul>
            <p className="aside">
              This is how the COS212 textbook counts (Drozdek, section 6.1), and how a Java method computes it:{' '}
              <code>height(node) = 1 + max(height(left), height(right))</code>, with 0 for <code>null</code>. Some books
              and code count edges instead, which gives one less.
            </p>
          </>
        ),
      },
      {
        type: 'try',
        title: 'Quick check',
        question: {
          id: 'm1-try',
          lo: 'LO1',
          type: 'node',
          bloom: 'Understand',
          tree: TREES.uneven,
          answer: [25],
          prompt: 'Click the node on the deepest level.',
          hints: [
            'The root is on level 1; each step down adds one level.',
            'Look for the node that is furthest down the picture.',
          ],
          explain: '25 is on level 4: the path 40 → 20 → 30 → 25 has four nodes. That is also the height of this tree.',
        },
      },
      {
        type: 'reflect',
        id: 'r-m1',
        prompt:
          'Name one thing in everyday life that is organised like a tree. What is its root, and what are its leaves?',
      },
    ],
    quiz: [
      {
        id: 'm1q1',
        lo: 'LO1',
        type: 'node',
        bloom: 'Remember',
        tree: TREES.balanced,
        answer: [50],
        prompt: 'Click the root of this tree.',
        hints: ['The root is the only node without a parent.', 'It is drawn at the very top.'],
        explain: '50 is the root: it has no parent.',
      },
      {
        id: 'm1q2',
        lo: 'LO1',
        type: 'node',
        bloom: 'Remember',
        tree: TREES.small,
        answer: [1, 6, 14],
        prompt: 'Click any leaf.',
        hints: [
          'A leaf has no children.',
          'Leaves are at the bottom ends of the branches; there is no edge going down from them.',
        ],
        explain: '1, 6 and 14 are leaves because they have no children. 10 is not a leaf; it has a right child (14).',
      },
      {
        id: 'm1q3',
        lo: 'LO1',
        type: 'mcq',
        bloom: 'Remember',
        tree: TREES.uneven,
        prompt: 'In this tree, what is the parent of 25?',
        options: ['20', '30', '40', 'It has no parent'],
        answer: 1,
        feedback: [
          '20 is the grandparent of 25: two edges up. The parent is the node one edge up.',
          '',
          '40 is the root, an ancestor of every node. The parent is the node directly above.',
          'Only the root has no parent. 25 has an edge going up to the node above it.',
        ],
        hints: ['The parent is the node directly above, joined by one edge.'],
        explain: '25 hangs directly below 30, so 30 is its parent.',
      },
      {
        id: 'm1q4',
        lo: 'LO1',
        type: 'mcq',
        bloom: 'Understand',
        tree: TREES.balanced,
        prompt: 'What is the height of this tree?',
        options: ['1', '2', '3', '7'],
        answer: 2,
        feedback: [
          'That is the level of the root alone. Height counts every level down to the deepest node.',
          'That counts the edges on the path (50 to 30 to 20). COS212 counts levels: the nodes 50, 30 and 20.',
          '',
          '7 is the number of nodes. Height is the number of levels.',
        ],
        hints: ['Count the levels: the root is level 1.', 'For example 50, 30, 20: one node on each level.'],
        explain: 'The tree has 3 levels (for example 50 → 30 → 20), so its height is 3.',
      },
      {
        id: 'm1q5',
        lo: 'LO1',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'In a binary tree, how many children can a node have?',
        options: ['Exactly 2', '0, 1 or 2', 'Any number', 'At least 1'],
        answer: 1,
        feedback: [
          'Leaves have no children and some nodes have only one. Binary limits the maximum to two.',
          '',
          'That describes a general tree. Binary means at most two children: left and right.',
          'Leaves have no children at all, and every tree has at least one leaf.',
        ],
        hints: ['Leaves are allowed in binary trees. How many children does a leaf have?'],
        explain: 'Binary means at most two: a node may have 0 (a leaf), 1 or 2 children.',
      },
    ],
    summary: [
      'A tree has one root; every other node has exactly one parent.',
      'Leaves have no children.',
      'In a binary tree each node has at most a left and a right child.',
      'The root is on level 1; the height of a tree is its number of levels.',
    ],
  },
  {
    id: 'm2',
    lo: 'LO2',
    part: 'structure',
    icon: Scale,
    minutes: 8,
    title: 'The BST rule',
    tagline: 'One simple rule that makes searching fast.',
    hook: (
      <>
        <p>
          I am thinking of a number between 1 and 100. Each time you guess, I say <em>higher</em> or <em>lower</em>. A
          good player guesses 50 first, then 25 or 75, and so on, halving the possibilities every time.
        </p>
        <p>
          A <strong>binary search tree (BST)</strong> stores data so that the computer can play this game automatically.
        </p>
      </>
    ),
    recall: (
      <p>
        From lesson 1: every node has a left subtree and a right subtree, and a tree is a <code>Node</code> object with
        two references. From everyday life: a dictionary is in alphabetical order, so you never read it page by page.
      </p>
    ),
    sections: [
      {
        type: 'text',
        title: 'The BST property',
        body: (
          <>
            <p>
              A binary tree is a <strong>binary search tree</strong> if, for <em>every</em> node:
            </p>
            <div className="rule">
              all keys in its <strong>left subtree</strong> &lt; the node&apos;s key &lt; all keys in its{' '}
              <strong>right subtree</strong>
            </div>
            <p>
              Smaller keys go left, larger keys go right, at every level. In this app all keys are distinct. Your
              lecturer will discuss how duplicates can be handled.
            </p>
          </>
        ),
      },
      {
        type: 'tree',
        title: 'A valid BST',
        tree: TREES.balanced,
        caption:
          'Check 50: everything on the left (20, 30, 40) is smaller and everything on the right (60, 70, 80) is larger. The same holds at 30 and at 70.',
      },
      {
        type: 'text',
        title: 'The most common mistake',
        warning: true,
        body: (
          <p>
            Many students only compare a node with its <em>own children</em>. That is not enough: the rule applies to
            the <strong>whole subtree</strong>. In the next tree every parent and child pair looks fine, but it is{' '}
            <strong>not</strong> a BST.
          </p>
        ),
      },
      {
        type: 'tree',
        event: 5,
        title: 'Looks fine, but it is broken',
        tree: fromSpec([50, [30, 20, 60], 70]),
        violation: 60,
        caption:
          '60 is the right child of 30, which is fine locally, but it sits in the LEFT subtree of 50, so it should be smaller than 50. It is not, so this is not a BST.',
      },
      {
        type: 'try',
        title: 'Quick check',
        question: {
          id: 'm2-try',
          lo: 'LO2',
          type: 'node',
          bloom: 'Analyse',
          tree: fromSpec([40, [20, 10, 30], [60, 45, [70, 35, null]]]),
          answer: [35],
          violation: 35,
          prompt: 'One node breaks the BST rule. Click it.',
          hints: [
            'Check every node against ALL of its ancestors, not only its parent.',
            'Every node in the right subtree of 40 must be greater than 40.',
          ],
          explain: '35 is in the right subtree of 40, so it must be greater than 40. It is not.',
        },
      },
      {
        type: 'reflect',
        id: 'r-m2',
        prompt:
          'In your own words: why is "compare each node only with its children" not enough to check the BST rule?',
      },
    ],
    quiz: [
      {
        id: 'm2q1',
        lo: 'LO2',
        type: 'mcq',
        bloom: 'Analyse',
        tree: TREES.small,
        prompt: 'Is this a valid BST?',
        options: ['Yes', 'No'],
        answer: 0,
        feedback: [
          '',
          'Check each node against all its ancestors: every key to the left is smaller and every key to the right is larger. Nothing breaks the rule here.',
        ],
        hints: ['Check each node: is everything on its left smaller and everything on its right larger?'],
        explain:
          'Every node satisfies the rule. For example 3 has 1 (smaller) on its left and 6 (larger) on its right, and all of them are below 8.',
      },
      {
        id: 'm2q2',
        lo: 'LO2',
        type: 'mcq',
        bloom: 'Analyse',
        tree: fromSpec([25, [15, 10, 30], [40, 35, 50]]),
        violation: 30,
        prompt: 'Is this a valid BST?',
        options: ['Yes', 'No'],
        answer: 1,
        feedback: [
          'One node is on the wrong side of an ancestor further up. Checking each node against its parent only is not enough.',
          '',
        ],
        hints: ['Look at the left subtree of 25. Must all of those keys be smaller or larger than 25?'],
        explain: '30 is in the left subtree of 25 but is larger than 25, so the tree is not a BST.',
      },
      {
        id: 'm2q3',
        lo: 'LO2',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'Where is the SMALLEST key in a non-empty BST?',
        options: ['At the root', 'At the leftmost node (keep going left)', 'At the rightmost node', 'At any leaf'],
        answer: 1,
        feedback: [
          "The root's left subtree holds smaller keys, unless it is empty.",
          '',
          'Going right always leads to larger keys, so the rightmost node holds the largest key.',
          'Leaves can hold large keys too. Only the path that keeps going left leads to the smallest.',
        ],
        hints: ['Smaller keys are always to the left.'],
        explain: 'Starting at the root and following left children until you cannot go further reaches the minimum.',
      },
      {
        id: 'm2q4',
        lo: 'LO2',
        type: 'node',
        bloom: 'Apply',
        tree: TREES.lecture,
        answer: [27],
        prompt: 'Click the LARGEST key without reading all the numbers. Use the BST rule.',
        hints: ['Larger keys are always to the right.', 'Start at the root and keep following right children.'],
        explain: 'Follow right children from the root: 15 → 23 → 27. The rightmost node is the maximum.',
      },
      {
        id: 'm2q5',
        lo: 'LO2',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'A node has key 50. Which key could legally appear anywhere in its RIGHT subtree?',
        options: ['12', '49', '50', '73'],
        answer: 3,
        feedback: [
          '12 < 50, so it belongs in the left subtree.',
          '49 is close, but still smaller than 50, so it belongs on the left.',
          'Keys are distinct here, and the right subtree holds only keys larger than 50.',
          '',
        ],
        hints: ['Everything in the right subtree must be greater than the node.'],
        explain: 'Only keys greater than 50 may appear in its right subtree.',
      },
    ],
    summary: [
      'BST rule: left subtree < node < right subtree, for every node.',
      'Check against all ancestors, not just the parent.',
      'Minimum is the leftmost node; maximum is the rightmost node.',
    ],
  },
  {
    id: 'm3',
    lo: 'LO3',
    part: 'structure',
    icon: Search,
    minutes: 10,
    title: 'Search and insert',
    tagline: 'Use the BST rule to find keys and to add new ones.',
    hook: (
      <p>
        Looking up a word in a paper dictionary, you never read it from page 1. You open somewhere in the middle and
        decide: <em>earlier</em> or <em>later</em>? BST search works exactly like that.
      </p>
    ),
    recall: (
      <p>
        From lesson 2: in a BST every key on the left is smaller and every key on the right is larger. From the warm-up:
        halving the options at every step gets you to the answer very quickly.
      </p>
    ),
    sections: [
      {
        type: 'text',
        title: 'Searching',
        body: (
          <ol>
            <li>Start at the root.</li>
            <li>
              If the key equals the current key, you have <strong>found</strong> it.
            </li>
            <li>
              If the key is <strong>smaller</strong>, continue in the <strong>left</strong> subtree; if it is{' '}
              <strong>larger</strong>, continue in the <strong>right</strong> subtree.
            </li>
            <li>
              If you need to move to a child that does not exist (<code>null</code>), the key is{' '}
              <strong>not in the tree</strong>.
            </li>
          </ol>
        ),
      },
      {
        type: 'text',
        title: 'Search with the rule, and without it',
        body: (
          <>
            <p>
              BST search uses the BST rule to skip a whole subtree at every step. It is an operation of the{' '}
              <strong>data structure</strong>, and it only works because the keys are in order.
            </p>
            <p className="aside">
              The <strong>algorithm</strong> of this app, tree search in lessons 4 and 5, finds a key <em>without</em>{' '}
              using the rule. Lesson 6 compares the two.
            </p>
          </>
        ),
      },
      { type: 'animate', title: 'Worked example: search for 60', tree: TREES.balanced, kind: 'search', key: 60 },
      {
        type: 'animate',
        title: 'Worked example: search for 45, which is not there',
        tree: TREES.balanced,
        kind: 'search',
        key: 45,
      },
      {
        type: 'text',
        title: 'Inserting',
        body: (
          <>
            <p>
              To insert a key, <strong>search for it</strong>. When the search falls off the tree at a <code>null</code>{' '}
              link, that empty spot is exactly where the new node belongs.
            </p>
            <p>
              So a newly inserted node is <strong>always a leaf</strong>. Existing nodes never move.
            </p>
          </>
        ),
      },
      { type: 'animate', title: 'Worked example: insert 65', tree: TREES.balanced, kind: 'insert', key: 65 },
      {
        type: 'try',
        title: 'Your turn',
        question: {
          id: 'm3-try',
          lo: 'LO3',
          type: 'slot',
          bloom: 'Apply',
          tree: TREES.balanced,
          value: 35,
          prompt: 'Click the empty spot (+) where 35 will be inserted.',
          hints: ['Search for 35: compare with 50 first.', '35 < 50, go left; 35 > 30, go right; now compare with 40.'],
          explain: '50, go left. 30, go right. 40, go left. The left child of 40 is empty, so 35 goes there.',
        },
      },
      { type: 'reflect', id: 'r-m3', prompt: 'Why must a newly inserted key always end up as a leaf?' },
    ],
    quiz: [
      {
        id: 'm3q1',
        lo: 'LO3',
        type: 'slot',
        bloom: 'Apply',
        tree: TREES.lecture,
        value: 21,
        prompt: 'Click where 21 will be inserted.',
        hints: ['21 > 15, so go right.', '21 < 23, so go left, then compare with 20.'],
        explain: '15, go right. 23, go left. 20, go right. The right child of 20 is empty, so 21 goes there.',
      },
      {
        id: 'm3q2',
        lo: 'LO3',
        type: 'mcq',
        bloom: 'Apply',
        tree: TREES.balanced,
        prompt: 'How many nodes are compared when searching for 40?',
        options: ['1', '2', '3', '7'],
        answer: 2,
        feedback: [
          'Only a search for the root takes one comparison. 40 is further down.',
          'Count the node that matches as well: it is compared too.',
          '',
          'Search follows one path from the root and never looks at the other nodes.',
        ],
        hints: ['Trace it: start at the root and count each node you look at.'],
        explain: '50 (go left), 30 (go right), 40 (found): 3 comparisons.',
      },
      {
        id: 'm3q3',
        lo: 'LO3',
        type: 'node',
        bloom: 'Apply',
        tree: TREES.balanced,
        answer: [60],
        prompt: 'Searching for 65, which is the LAST node examined before the search reports "not found"?',
        hints: ['65 > 50, go right. 65 < 70, go left.', 'What is the left child of 70? Does it have a right child?'],
        explain: '50, then 70, then 60. 65 > 60, but 60 has no right child, so the search stops at 60.',
      },
      {
        id: 'm3q4',
        lo: 'LO3',
        type: 'slot',
        bloom: 'Apply',
        tree: TREES.small,
        value: 7,
        prompt: 'Click where 7 will be inserted.',
        hints: ['Start at 8: is 7 smaller or larger?', '8, go left. 3, go right. Then compare with 6.'],
        explain: '7 < 8, go left. 7 > 3, go right. 7 > 6, go right. The right child of 6 is empty.',
      },
      {
        id: 'm3q5',
        lo: 'LO3',
        type: 'mcq',
        bloom: 'Apply',
        prompt: 'You insert 10, 20, 30, 40 (in that order) into an empty BST. What does the tree look like?',
        options: [
          'A balanced tree with 20 at the root',
          'A chain leaning right: every node only has a right child',
          'A chain leaning left',
          'It depends on the computer',
        ],
        answer: 1,
        feedback: [
          'The first key, 10, becomes the root and stays there. Insert never rebalances the tree.',
          '',
          'Each new key is larger than the one before, so it goes right, not left.',
          'Insert is deterministic: the same keys in the same order always build the same tree.',
        ],
        hints: ['10 becomes the root. Where does 20 go? And 30?'],
        explain:
          'Each new key is larger than everything before it, so it always goes right. The tree becomes a chain. Lesson 6 explains why that is slow.',
      },
    ],
    summary: [
      'Search: compare and go left (smaller) or right (larger) until found or null.',
      'Insert is an unsuccessful search plus a new leaf at the null spot.',
      'The order in which keys are inserted determines the shape of the tree.',
    ],
  },
  {
    id: 'm4',
    lo: 'LO4',
    part: 'algorithm',
    icon: Layers,
    minutes: 12,
    title: 'Tree search: depth first',
    tagline: 'Search for a key with a stack, then walk the whole tree: pre-order, in-order and post-order.',
    hook: (
      <p>
        Searching a cave system for a lost friend, you follow one tunnel as <em>deep</em> as it goes before backing up
        to try the next one. <strong>Depth first tree search</strong> looks for a key in a tree in the same way.
      </p>
    ),
    recall: (
      <p>
        From lesson 3: BST search uses the BST rule to follow one path. Every subtree is itself a tree, so a method can
        handle a node and then call itself on <code>node.left</code> and <code>node.right</code>. From your programming
        modules: recursion, and the call stack that keeps every call that has not returned yet.
      </p>
    ),
    sections: [
      {
        type: 'text',
        title: 'Searching without the rule',
        body: (
          <>
            <p>
              Sometimes a search cannot use the BST rule: you are looking for something the keys are not ordered by, or
              you cannot trust that the rule holds. Then you search <strong>uninformed</strong>: check nodes one by one
              until you find the key, or run out of nodes.
            </p>
            <p>
              <strong>Tree search</strong>, this app's algorithm, keeps a <strong>frontier</strong>: the nodes found but
              not yet checked. It repeats one loop: take a node out, check it, add its children. Kept on a{' '}
              <strong>stack</strong>, the frontier makes the search dive deep first: <strong>depth first search</strong>
              .
            </p>
          </>
        ),
      },
      {
        type: 'frontier',
        title: 'Worked example: depth first search for 12',
        tree: TREES.lecture,
        key: 12,
        kind: 'dfs',
        caption: 'Watch the stack decide which node is checked next. The search never looks at the BST rule.',
      },
      {
        type: 'text',
        title: 'Three orders, one idea',
        body: (
          <>
            <p>
              When depth first search never finds its key, it checks every node once: a complete walk like that is a{' '}
              <strong>traversal</strong>. The search above checked nodes in pre-order. Written{' '}
              <strong>recursively</strong>, a depth first walk handles the node, its left subtree and its right subtree;
              the only question is <em>when</em> it visits the node itself:
            </p>
            <table className="mini">
              <thead>
                <tr>
                  <th>Traversal</th>
                  <th>Order</th>
                  <th>Way to remember it</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Pre</strong>-order
                  </td>
                  <td>
                    <strong>Node</strong>, Left, Right
                  </td>
                  <td>
                    node <em>before</em> its subtrees
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>In</strong>-order
                  </td>
                  <td>
                    Left, <strong>Node</strong>, Right
                  </td>
                  <td>
                    node <em>in between</em>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Post</strong>-order
                  </td>
                  <td>
                    Left, Right, <strong>Node</strong>
                  </td>
                  <td>
                    node <em>after</em> its subtrees
                  </td>
                </tr>
              </tbody>
            </table>
            <p>Left always comes before right. Only the position of the node changes.</p>
            <p>
              While a call works on the left subtree, the calls above it wait. Java keeps them on the{' '}
              <strong>call stack</strong>: the newest call on top, and it always finishes first (last in, first out).
              The animations show the call stack as a list with the running call first.
            </p>
            <p className="aside">
              This lesson and the next are the two halves of one algorithm, tree search. Both keep a list of nodes still
              to visit. Keep it on a stack and the walk goes deep first; keep it in a queue, as lesson 5 does, and it
              goes level by level.
            </p>
          </>
        ),
      },
      { type: 'animate', title: 'Worked example: pre-order', tree: TREES.lecture, kind: 'pre' },
      {
        type: 'animate',
        title: 'Worked example: in-order',
        tree: TREES.lecture,
        kind: 'in',
        callout:
          'Look at the output: 4, 9, 12, 15, 20, 23, 27. It is sorted. The in-order traversal of any BST returns its keys in ascending order.',
      },
      { type: 'animate', title: 'Worked example: post-order', tree: TREES.lecture, kind: 'post' },
      {
        type: 'text',
        title: 'The call stack',
        body: (
          <p>
            Each recursive call waits on the <strong>call stack</strong> until its subtrees are finished. In the
            animations, nodes waiting on the stack are outlined. Depth first traversal therefore behaves like a{' '}
            <strong>stack</strong> (last in, first out): the most recent call is always finished first.
          </p>
        ),
      },
      {
        type: 'try',
        title: 'Your turn',
        question: {
          id: 'm4-try',
          lo: 'LO4',
          type: 'order',
          bloom: 'Apply',
          kind: 'pre',
          tree: TREES.small,
          prompt: 'Click the nodes in PRE-ORDER (Node, Left, Right).',
          hints: [
            'Pre-order starts at the root.',
            'After visiting a node, finish its ENTIRE left subtree before going right.',
          ],
          explain: 'Pre-order: 8, 3, 1, 6, 10, 14.',
        },
      },
      {
        type: 'reflect',
        id: 'r-m4',
        prompt: 'Explain to a friend why in-order traversal of a BST gives the keys in sorted order.',
      },
    ],
    quiz: [
      {
        id: 'm4q1',
        lo: 'LO4',
        type: 'order',
        bloom: 'Apply',
        kind: 'in',
        tree: TREES.balanced,
        prompt: 'Click the nodes in IN-ORDER.',
        hints: ['In-order is Left, Node, Right.', 'For a BST the answer is the keys in sorted order.'],
        explain: 'In-order of a BST is sorted: 20, 30, 40, 50, 60, 70, 80.',
      },
      {
        id: 'm4q2',
        lo: 'LO4',
        type: 'order',
        bloom: 'Apply',
        kind: 'post',
        tree: TREES.small,
        prompt: 'Click the nodes in POST-ORDER.',
        hints: ['Post-order is Left, Right, Node. The root is always LAST.', 'Start with the leftmost leaf.'],
        explain: 'Post-order: 1, 6, 3, 14, 10, 8. Each node comes after both of its subtrees.',
      },
      {
        id: 'm4q3',
        lo: 'LO4',
        type: 'order',
        bloom: 'Apply',
        kind: 'pre',
        tree: TREES.uneven,
        prompt: 'Click the nodes in PRE-ORDER.',
        hints: [
          'Pre-order is Node, Left, Right. The root is FIRST.',
          "After 20, finish all of 20's subtree (10, then 30 and its child) before moving to 60.",
        ],
        explain: 'Pre-order: 40, 20, 10, 30, 25, 60, 50, 70.',
      },
      {
        id: 'm4q4',
        lo: 'LO4',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'The pre-order traversal of a BST is 33, 21, 9, 27, 48, 52. Which key is the root?',
        options: ['9', '21', '33', '52'],
        answer: 2,
        feedback: [
          '9 is the smallest key, the leftmost node. Pre-order starts at the root, not at the smallest key.',
          '21 comes second: it is the root of the left subtree.',
          '',
          'In pre-order the root comes first. The root comes last only in post-order.',
        ],
        hints: ['In pre-order, which node is visited first?'],
        explain: 'Pre-order visits the root first, so the root is 33.',
      },
      {
        id: 'm4q5',
        lo: 'LO4',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'In POST-order, which node is always visited last?',
        options: ['The leftmost leaf', 'The root', 'The rightmost leaf', 'It depends on the tree'],
        answer: 1,
        feedback: [
          'The leftmost leaf comes first in post-order, not last.',
          '',
          'The rightmost leaf finishes the right subtree, and then the root is still waiting.',
          'Post-order visits a node after both its subtrees, so the root, above everything, is always last.',
        ],
        hints: ['Post-order is Left, Right, Node. Apply that to the whole tree.'],
        explain: 'The root is visited only after both of its subtrees are finished, so it is always last.',
      },
      {
        id: 'm4q6',
        lo: 'LO4',
        type: 'node',
        bloom: 'Apply',
        tree: TREES.lecture,
        answer: [23],
        prompt: 'Depth first search, with a stack, looks for 20 in this tree. Click the node it checks just before 20.',
        hints: [
          'Depth first search checks nodes in pre-order: the root, then the whole left subtree, then the right.',
          'It checks 15, 9, 4, 12 first. Which node comes next?',
        ],
        explain: 'It checks 15, 9, 4, 12, 23 and then 20, so 23 is checked just before 20.',
      },
    ],
    summary: [
      'Pre-order: Node, Left, Right. In-order: Left, Node, Right. Post-order: Left, Right, Node.',
      'In-order of a BST gives sorted output.',
      'Depth first traversal uses recursion, which means a call stack.',
      'Every traversal visits each node exactly once: O(n).',
    ],
  },
  {
    id: 'm5',
    lo: 'LO5',
    part: 'algorithm',
    icon: Rows3,
    minutes: 10,
    title: 'Tree search: breadth first',
    tagline: 'Search for a key with a queue, level by level.',
    hook: (
      <p>
        Drop a stone into a pond and the ripples spread out one ring at a time.{' '}
        <strong>Breadth first tree search</strong> checks a tree the same way: the root on level 1, then every node on
        level 2, then level 3, left to right, until it finds the key.
      </p>
    ),
    recall: (
      <p>
        From lesson 4: a depth first walk keeps its waiting work on a stack, last in, first out. From the warm-up: a
        queue is first in, first out, like a line at the canteen.
      </p>
    ),
    sections: [
      {
        type: 'text',
        title: 'Why a queue?',
        body: (
          <>
            <p>
              Breadth first search is the loop from lesson 4 with a <strong>queue</strong> as the frontier. When it
              checks a node, it cannot check the children yet: other nodes on the same level have to come first. So we
              put the children <strong>at the back of a queue</strong> and always take the next node{' '}
              <strong>from the front</strong>.
            </p>
            <p>
              A queue is <strong>first in, first out (FIFO)</strong>, like a line at the canteen. Nodes discovered
              earlier, on higher levels, are visited earlier.
            </p>
          </>
        ),
      },
      {
        type: 'frontier',
        title: 'Worked example: breadth first search for 22',
        tree: TREES.wide,
        key: 22,
        kind: 'bfs',
        caption:
          'The queue hands out the nodes level by level, so the search checks a whole level before going deeper.',
      },
      { type: 'animate', title: 'Worked example: a whole level-order walk', tree: TREES.wide, kind: 'level' },
      {
        type: 'try',
        title: 'Your turn',
        question: {
          id: 'm5-try',
          lo: 'LO5',
          type: 'order',
          bloom: 'Apply',
          kind: 'level',
          tree: TREES.lecture,
          prompt: 'Click the nodes in LEVEL-ORDER.',
          hints: ['Start with the root, then the whole next row from left to right.'],
          explain: 'Level-order: 15, 9, 23, 4, 12, 20, 27.',
        },
      },
      {
        type: 'text',
        title: 'Depth first and breadth first',
        body: (
          <table className="mini">
            <thead>
              <tr>
                <th />
                <th>Depth first (pre, in, post)</th>
                <th>Breadth first (level)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Explores</td>
                <td>one branch to the bottom, then backtracks</td>
                <td>one level at a time</td>
              </tr>
              <tr>
                <td>Helper structure</td>
                <td>stack (usually the recursion call stack)</td>
                <td>queue</td>
              </tr>
              <tr>
                <td>Typical implementation</td>
                <td>recursive</td>
                <td>iterative loop</td>
              </tr>
              <tr>
                <td>Time</td>
                <td>O(n)</td>
                <td>O(n)</td>
              </tr>
            </tbody>
          </table>
        ),
      },
      {
        type: 'reflect',
        id: 'r-m5',
        prompt:
          'Predict: what would happen to the visiting order if you replaced the queue in level-order with a stack?',
      },
      {
        type: 'frontier',
        title: 'Test your prediction: swap the queue for a stack',
        tree: TREES.wide,
        key: 99,
        caption:
          'This is the tree search loop from lessons 4 and 5, searching for 99. It is not in the tree, so both versions check every node. Only the waiting list changes: a queue hands back the node that has waited longest, a stack the one that arrived last. Step through both and compare the orders.',
      },
    ],
    quiz: [
      {
        id: 'm5q1',
        lo: 'LO5',
        type: 'order',
        bloom: 'Apply',
        kind: 'level',
        tree: TREES.wide,
        prompt: 'Click the nodes in LEVEL-ORDER.',
        hints: ['Row by row from the top, left to right within each row.', 'The last row has only one node.'],
        explain: 'Level-order: 30, 18, 45, 10, 22, 40, 50, 35.',
      },
      {
        id: 'm5q2',
        lo: 'LO5',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'Which data structure does a level-order traversal use to remember the nodes still to visit?',
        options: ['A stack', 'A queue', 'A sorted array', 'Another BST'],
        answer: 1,
        feedback: [
          'A stack gives back the newest node first, which dives deep: that is depth first.',
          '',
          'Sorting would order the nodes by key, not by level.',
          'A BST orders by key. Level-order needs the nodes in the order they were found.',
        ],
        hints: ['Nodes found first must be visited first.'],
        explain: 'A queue (FIFO) keeps the nodes in the order they were discovered: level by level.',
      },
      {
        id: 'm5q3',
        lo: 'LO5',
        type: 'order',
        bloom: 'Apply',
        kind: 'level',
        tree: TREES.uneven,
        prompt: 'Click the nodes in LEVEL-ORDER.',
        hints: ['Level 1: 40. Level 2: 20, 60. Level 3: …'],
        explain: 'Level-order: 40, 20, 60, 10, 30, 50, 70, 25.',
      },
      {
        id: 'm5q4',
        lo: 'LO5',
        type: 'mcq',
        bloom: 'Understand',
        prompt: 'Recursive pre-order traversal does not create a stack in the code. Which stack does it use?',
        options: ['None, recursion needs no memory', "The program's call stack", 'A hidden queue', 'The heap'],
        answer: 1,
        feedback: [
          'Every call that has not returned yet has to be remembered somewhere.',
          '',
          'A queue gives back the oldest item first. Recursion always returns to the newest call.',
          'The heap holds objects such as the nodes. Unfinished calls live on the call stack.',
        ],
        hints: ['Every function call that has not returned yet is stored somewhere.'],
        explain: 'Each active recursive call is a frame on the call stack, so depth first traversal is stack based.',
      },
      {
        id: 'm5q5',
        lo: 'LO5',
        type: 'mcq',
        bloom: 'Apply',
        tree: TREES.lecture,
        prompt:
          'Breadth first search, with a queue, looks for 20 in this tree. How many nodes does it check, 20 included?',
        options: ['3', '4', '6', '7'],
        answer: 2,
        feedback: [
          'That is BST search, which uses the rule to follow one path: 15, 23, 20. Tree search checks level by level.',
          'Count every node on levels 1 and 2, then the nodes on level 3 up to 20.',
          '',
          'The search stops as soon as it checks 20; it never reaches 27.',
        ],
        hints: ['It checks level by level: 15, then 9 and 23, then the bottom level from the left.'],
        explain: 'It checks 15, 9, 23, 4, 12 and then 20: six nodes.',
      },
    ],
    summary: [
      'Level-order visits the tree row by row, left to right.',
      'It uses a queue (FIFO); depth first uses a stack (LIFO).',
      'Swapping the queue for a stack turns the same loop into a depth first walk.',
      'Both visit each node once: O(n).',
    ],
  },
  {
    id: 'm6',
    lo: 'LO6',
    part: 'both',
    icon: Gauge,
    minutes: 8,
    title: 'Shape and efficiency',
    tagline: 'Why the shape of a tree matters, and which traversal to choose.',
    hook: (
      <p>
        Here are the same seven keys inserted in two different orders. Same data, very different trees. One of them is a
        lot slower to search. Which one?
      </p>
    ),
    recall: (
      <p>
        From lesson 3: a search follows one path from the root, so its cost is the number of levels on that path. From
        lessons 4 and 5: a traversal visits every node once.
      </p>
    ),
    sections: [
      {
        type: 'compare',
        title: 'Same keys, different shapes',
        items: [
          { tree: BALANCED_7, caption: `Inserted 4, 2, 6, 1, 3, 5, 7. Balanced: height ${height(BALANCED_7)}.` },
          {
            tree: fromKeys([1, 2, 3, 4, 5, 6, 7]),
            caption: `Inserted 1, 2, 3, 4, 5, 6, 7. A degenerate chain: height ${height(fromKeys([1, 2, 3, 4, 5, 6, 7]))}.`,
          },
        ],
      },
      {
        type: 'text',
        title: 'Cost depends on height',
        body: (
          <>
            <p>
              Search and insert follow <strong>one path</strong> from the root, one comparison per level, so they take
              at most <strong>h</strong> comparisons, where <em>h</em> is the height.
            </p>
            <ul>
              <li>
                <strong>Balanced</strong> tree: h ≈ log₂ n. With 1 000 000 keys that is only about 20 levels, so{' '}
                <strong>O(log n)</strong>.
              </li>
              <li>
                <strong>Degenerate</strong> tree, for example from sorted input: h = n, no better than a linked list, so{' '}
                <strong>O(n)</strong>.
              </li>
            </ul>
            <p>
              <strong>Tree search</strong>, depth first or breadth first, does not use the rule, so it may check all n
              nodes before it finds the key, or decides it is not there: <strong>O(n)</strong> whatever the shape. A
              traversal always visits all n nodes, so it is O(n) too. BST search is faster only because it uses the rule
              to follow one path.
            </p>
            <p className="aside">
              Self-balancing trees (AVL, red-black) keep the height O(log n) automatically. You will meet them later in
              COS212.
            </p>
          </>
        ),
      },
      {
        type: 'animate',
        title: 'Worked example: search for 7 in the balanced tree',
        tree: BALANCED_7,
        kind: 'search',
        key: 7,
        callout: `${searchPath(BALANCED_7, 7).compared.length} comparisons, one per level. Now predict the same search in the chain shaped tree.`,
      },
      {
        type: 'try',
        title: 'Your turn',
        question: {
          id: 'm6-try',
          lo: 'LO6',
          type: 'mcq',
          bloom: 'Analyse',
          tree: fromKeys([1, 2, 3, 4, 5, 6, 7]),
          prompt: 'How many comparisons does a search for 7 take in this tree?',
          options: ['1', '3', '4', '7'],
          answer: 3,
          feedback: [
            '1 is the root here, and 7 is at the bottom of the chain.',
            'In a balanced tree of 7 keys it would be 3. This tree is a chain, so every node is on the path.',
            'Count every node from the root down to 7, including 7 itself.',
            '',
          ],
          hints: [
            'Count the nodes on the path from the root down to 7.',
            'In this chain every node has only a right child.',
          ],
          explain:
            'The search compares 1, 2, 3, 4, 5, 6 and then 7: seven comparisons, one per level. In the balanced tree with the same keys it takes three.',
        },
      },
      {
        type: 'text',
        title: 'Which traversal should I use?',
        body: (
          <table className="mini">
            <thead>
              <tr>
                <th>Task</th>
                <th>Traversal</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Print keys in sorted order</td>
                <td>In-order</td>
                <td>Left &lt; Node &lt; Right</td>
              </tr>
              <tr>
                <td>Copy or save a tree so it can be rebuilt with the same shape</td>
                <td>Pre-order</td>
                <td>parents come before children</td>
              </tr>
              <tr>
                <td>Delete a tree, or compute sizes and heights bottom up</td>
                <td>Post-order</td>
                <td>children are finished before the parent</td>
              </tr>
              <tr>
                <td>Print level by level, or find the nearest node to the root</td>
                <td>Level-order</td>
                <td>visits level by level</td>
              </tr>
            </tbody>
          </table>
        ),
      },
      {
        type: 'reflect',
        id: 'r-m6',
        prompt:
          'A student loads an already sorted list of 10 000 student numbers into a BST. What problem will they have, and what could they do about it?',
      },
    ],
    quiz: [
      {
        id: 'm6q1',
        lo: 'LO6',
        type: 'mcq',
        bloom: 'Analyse',
        prompt: 'What is the worst case number of comparisons to search a degenerate (chain shaped) BST with n nodes?',
        options: ['1', 'about log₂ n', 'n', 'n²'],
        answer: 2,
        feedback: [
          'One comparison only finds the root.',
          'That is the balanced case. A chain has height n, so the search may pass every node.',
          '',
          'Search compares each node on one path once, so it never exceeds n.',
        ],
        hints: ['In a chain, each node has only one child. How long is the only path?'],
        explain: 'The path can contain all n nodes, so search is O(n).',
      },
      {
        id: 'm6q2',
        lo: 'LO6',
        type: 'mcq',
        bloom: 'Analyse',
        prompt: 'What is the time complexity of an in-order traversal of a BST with n nodes?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 2,
        feedback: [
          'A traversal visits every node, so its cost grows with n.',
          'log n is the length of one root to leaf path. A traversal visits all n nodes, not one path.',
          '',
          'Each node is visited once with constant work per visit, so there is no log factor.',
        ],
        hints: ['A traversal visits every node exactly once.'],
        explain: "Every node is visited once, so traversal is O(n), regardless of the tree's shape.",
      },
      {
        id: 'm6q3',
        lo: 'LO6',
        type: 'mcq',
        bloom: 'Evaluate',
        prompt:
          'You want to safely delete every node of a tree, and each node may only be removed after its children. Which traversal fits?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        answer: 2,
        feedback: [
          'Pre-order handles a node before its children, so the children would be cut off first.',
          'In-order handles a node between its subtrees, so its right subtree is still attached.',
          '',
          'Level-order works top down, so parents are handled before their children.',
        ],
        hints: ['Children must be finished BEFORE the parent.'],
        explain: 'Post-order handles both subtrees before the node itself.',
      },
      {
        id: 'm6q4',
        lo: 'LO6',
        type: 'mcq',
        bloom: 'Analyse',
        prompt: 'A perfectly balanced BST holds 15 keys. What is its height?',
        options: ['3', '4', '8', '15'],
        answer: 1,
        feedback: [
          'That counts the edges from top to bottom. COS212 counts levels: one more.',
          '',
          'That is the number of nodes on the bottom level, not the number of levels.',
          'That is the height of a chain of 15 keys, the worst case, not a balanced tree.',
        ],
        hints: ['Levels hold 1, 2, 4, 8 nodes.', '1 + 2 + 4 + 8 = 15. How many levels is that?'],
        explain: '15 nodes fill 4 levels (1 + 2 + 4 + 8), so the height is 4.',
      },
      {
        id: 'm6q5',
        lo: 'LO6',
        type: 'mcq',
        bloom: 'Evaluate',
        prompt: 'Which insertion order produces the most balanced BST for the keys 1 to 7?',
        options: ['1, 2, 3, 4, 5, 6, 7', '7, 6, 5, 4, 3, 2, 1', '4, 2, 6, 1, 3, 5, 7', '1, 7, 2, 6, 3, 5, 4'],
        answer: 2,
        feedback: [
          'Sorted input sends every key to the right: a chain of height 7.',
          'Reverse sorted input sends every key to the left: a chain of height 7.',
          '',
          'Alternating from the ends makes a zigzag: each key still has only one child.',
        ],
        hints: ['A good root splits the remaining keys in half.'],
        explain: 'Inserting the middle key (4) first, then the middles of each half, gives a perfectly balanced tree.',
      },
      {
        id: 'm6q6',
        lo: 'LO6',
        type: 'mcq',
        bloom: 'Analyse',
        tree: fromKeys([4, 2, 6, 1, 3, 5, 7]),
        prompt:
          'Searching for 7 in this tree: how many nodes does breadth first tree search check, and how many does BST search compare?',
        options: ['3 and 3', '7 and 3', '3 and 7', '7 and 7'],
        answer: 1,
        feedback: [
          'BST search does take 3. Tree search cannot use the rule, so it checks level by level and reaches 7 last.',
          '',
          'The other way round: BST search follows the path 4, 6, 7, while tree search checks every node first.',
          'Tree search does check all 7. BST search uses the rule, so it only follows the path 4, 6, 7.',
        ],
        hints: [
          'Tree search checks level by level and 7 is the last node on the last level.',
          'BST search follows one path.',
        ],
        explain:
          'Breadth first search checks 4, 2, 6, 1, 3, 5, 7: all seven nodes. BST search compares 4, 6 and 7: three. The rule is what saves the work.',
      },
    ],
    summary: [
      'Search and insert cost O(h): O(log n) when balanced, O(n) when degenerate.',
      'Sorted input creates a degenerate tree.',
      'Traversals are always O(n).',
      'Choose: sorted output, in-order; copy, pre-order; delete, post-order; by level, level-order.',
    ],
  },
]

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, Module>
