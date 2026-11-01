import { Gauge, Layers, Network, Rows3, Scale, Search } from 'lucide-react'
import { fromKeys, fromSpec } from '../engine/bst'
import type { Module, ModuleId, Outcome, OutcomeId } from './types'

export const OUTCOMES: Record<OutcomeId, Outcome> = {
  LO1: {
    short: 'Tree vocabulary',
    text: 'Identify the parts of a tree: root, parent, child, leaf, edge, subtree, depth and height.',
    bloom: 'Remember, Understand',
    module: 'm1',
  },
  LO2: {
    short: 'The BST rule',
    text: 'Explain the BST ordering property and decide whether a binary tree is a BST.',
    bloom: 'Understand, Analyse',
    module: 'm2',
  },
  LO3: {
    short: 'Search and insert',
    text: 'Trace BST search and insertion step by step.',
    bloom: 'Apply',
    module: 'm3',
  },
  LO4: {
    short: 'Depth first traversals',
    text: 'Produce pre-order, in-order and post-order traversals of a binary tree.',
    bloom: 'Apply',
    module: 'm4',
  },
  LO5: {
    short: 'Breadth first traversal',
    text: 'Produce a level-order traversal and explain why it uses a queue.',
    bloom: 'Apply, Understand',
    module: 'm5',
  },
  LO6: {
    short: 'Shape and efficiency',
    text: 'Relate tree height to the cost of search and insert, and choose a suitable traversal for a task.',
    bloom: 'Analyse, Evaluate',
    module: 'm6',
  },
}

export const OUTCOME_IDS = Object.keys(OUTCOMES) as OutcomeId[]

export const TREES = {
  balanced: fromKeys([50, 30, 70, 20, 40, 60, 80]),
  uneven: fromKeys([40, 20, 60, 10, 30, 50, 70, 25]),
  small: fromKeys([8, 3, 10, 1, 6, 14]),
  lecture: fromKeys([15, 9, 23, 4, 12, 20, 27]),
  wide: fromKeys([30, 18, 45, 10, 22, 40, 50, 35]),
}

export const MODULES: Module[] = [
  {
    id: 'm1',
    lo: 'LO1',
    icon: Network,
    minutes: 8,
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
    sections: [
      {
        type: 'text',
        title: 'What is a tree?',
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
        type: 'text',
        title: 'Binary trees, depth and height',
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
                The <strong>depth</strong> of a node is the number of edges from the root down to it. The root has depth
                0.
              </li>
              <li>
                The <strong>height</strong> of a tree is the number of edges on the longest path from the root to a
                leaf. A single node has height 0.
              </li>
            </ul>
            <p className="aside">
              Some textbooks count <em>levels</em> (nodes) instead of edges, which adds 1. Check which convention your
              COS212 notes use.
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
          tree: TREES.uneven,
          answer: [25],
          prompt: 'Click the node with the greatest depth.',
          hints: [
            'Depth is the number of edges from the root.',
            'Look for the node that is furthest down the picture.',
          ],
          explain:
            '25 is 3 edges below the root (40 → 20 → 30 → 25), so its depth is 3, which is also the height of this tree.',
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
        tree: TREES.uneven,
        prompt: 'In this tree, what is the parent of 25?',
        options: ['20', '30', '40', 'It has no parent'],
        answer: 1,
        hints: ['The parent is the node directly above, joined by one edge.'],
        explain: '25 hangs directly below 30, so 30 is its parent.',
      },
      {
        id: 'm1q4',
        lo: 'LO1',
        type: 'mcq',
        tree: TREES.balanced,
        prompt: 'What is the height of this tree, counting edges?',
        options: ['1', '2', '3', '7'],
        answer: 1,
        hints: ['Count the edges on the longest path from the root down to a leaf.', 'For example 50 → 30 → 20.'],
        explain: 'The longest root to leaf path is 2 edges long (for example 50 → 30 → 20), so the height is 2.',
      },
      {
        id: 'm1q5',
        lo: 'LO1',
        type: 'mcq',
        prompt: 'In a binary tree, how many children can a node have?',
        options: ['Exactly 2', '0, 1 or 2', 'Any number', 'At least 1'],
        answer: 1,
        hints: ['Leaves are allowed in binary trees. How many children does a leaf have?'],
        explain: 'Binary means at most two: a node may have 0 (a leaf), 1 or 2 children.',
      },
    ],
    summary: [
      'A tree has one root; every other node has exactly one parent.',
      'Leaves have no children.',
      'In a binary tree each node has at most a left and a right child.',
      'Depth counts edges from the root to a node; height is the depth of the deepest leaf.',
    ],
  },
  {
    id: 'm2',
    lo: 'LO2',
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
        tree: TREES.small,
        prompt: 'Is this a valid BST?',
        options: ['Yes', 'No'],
        answer: 0,
        hints: ['Check each node: is everything on its left smaller and everything on its right larger?'],
        explain:
          'Every node satisfies the rule. For example 3 has 1 (smaller) on its left and 6 (larger) on its right, and all of them are below 8.',
      },
      {
        id: 'm2q2',
        lo: 'LO2',
        type: 'mcq',
        tree: fromSpec([25, [15, 10, 30], [40, 35, 50]]),
        violation: 30,
        prompt: 'Is this a valid BST?',
        options: ['Yes', 'No'],
        answer: 1,
        hints: ['Look at the left subtree of 25. Must all of those keys be smaller or larger than 25?'],
        explain: '30 is in the left subtree of 25 but is larger than 25, so the tree is not a BST.',
      },
      {
        id: 'm2q3',
        lo: 'LO2',
        type: 'mcq',
        prompt: 'Where is the SMALLEST key in a non-empty BST?',
        options: ['At the root', 'At the leftmost node (keep going left)', 'At the rightmost node', 'At any leaf'],
        answer: 1,
        hints: ['Smaller keys are always to the left.'],
        explain: 'Starting at the root and following left children until you cannot go further reaches the minimum.',
      },
      {
        id: 'm2q4',
        lo: 'LO2',
        type: 'node',
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
        prompt: 'A node has key 50. Which key could legally appear anywhere in its RIGHT subtree?',
        options: ['12', '49', '50', '73'],
        answer: 3,
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
        tree: TREES.balanced,
        prompt: 'How many nodes are compared when searching for 40?',
        options: ['1', '2', '3', '7'],
        answer: 2,
        hints: ['Trace it: start at the root and count each node you look at.'],
        explain: '50 (go left), 30 (go right), 40 (found): 3 comparisons.',
      },
      {
        id: 'm3q3',
        lo: 'LO3',
        type: 'node',
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
        prompt: 'You insert 10, 20, 30, 40 (in that order) into an empty BST. What does the tree look like?',
        options: [
          'A balanced tree with 20 at the root',
          'A chain leaning right: every node only has a right child',
          'A chain leaning left',
          'It depends on the computer',
        ],
        answer: 1,
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
    icon: Layers,
    minutes: 12,
    title: 'Depth first traversals',
    tagline: 'Visit every node: pre-order, in-order and post-order.',
    hook: (
      <p>
        Exploring a cave system, you follow one tunnel as <em>deep</em> as it goes before backing up to try the next
        one. A <strong>depth first traversal</strong> visits every node in the tree in the same way.
      </p>
    ),
    sections: [
      {
        type: 'text',
        title: 'Three orders, one idea',
        body: (
          <>
            <p>
              A <strong>traversal</strong> visits every node exactly once. For a binary tree, depth first traversal is
              naturally <strong>recursive</strong>: handle the node, its left subtree and its right subtree. The only
              question is <em>when</em> you visit the node itself:
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
        prompt: 'The pre-order traversal of a BST is 33, 21, 9, 27, 48, 52. Which key is the root?',
        options: ['9', '21', '33', '52'],
        answer: 2,
        hints: ['In pre-order, which node is visited first?'],
        explain: 'Pre-order visits the root first, so the root is 33.',
      },
      {
        id: 'm4q5',
        lo: 'LO4',
        type: 'mcq',
        prompt: 'In POST-order, which node is always visited last?',
        options: ['The leftmost leaf', 'The root', 'The rightmost leaf', 'It depends on the tree'],
        answer: 1,
        hints: ['Post-order is Left, Right, Node. Apply that to the whole tree.'],
        explain: 'The root is visited only after both of its subtrees are finished, so it is always last.',
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
    icon: Rows3,
    minutes: 10,
    title: 'Breadth first traversal',
    tagline: 'Level by level with a queue.',
    hook: (
      <p>
        Drop a stone into a pond and the ripples spread out one ring at a time. A <strong>breadth first</strong>{' '}
        (level-order) traversal does the same: first the root, then every node at depth 1, then depth 2, and so on, left
        to right.
      </p>
    ),
    sections: [
      {
        type: 'text',
        title: 'Why a queue?',
        body: (
          <>
            <p>
              When we visit a node, we cannot visit its children yet: other nodes on the same level have to come first.
              So we put the children <strong>at the back of a queue</strong> and always take the next node{' '}
              <strong>from the front</strong>.
            </p>
            <p>
              A queue is <strong>first in, first out (FIFO)</strong>, like a line at the canteen. Nodes discovered
              earlier, on higher levels, are visited earlier.
            </p>
          </>
        ),
      },
      { type: 'animate', title: 'Worked example: level-order', tree: TREES.wide, kind: 'level' },
      {
        type: 'try',
        title: 'Your turn',
        question: {
          id: 'm5-try',
          lo: 'LO5',
          type: 'order',
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
        caption:
          'The same loop runs both walks. Only the waiting list changes: a queue hands back the node that has waited longest, a stack the one that arrived last. Step through both and compare the visit orders.',
      },
    ],
    quiz: [
      {
        id: 'm5q1',
        lo: 'LO5',
        type: 'order',
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
        prompt: 'Which data structure does a level-order traversal use to remember the nodes still to visit?',
        options: ['A stack', 'A queue', 'A sorted array', 'Another BST'],
        answer: 1,
        hints: ['Nodes found first must be visited first.'],
        explain: 'A queue (FIFO) keeps the nodes in the order they were discovered: level by level.',
      },
      {
        id: 'm5q3',
        lo: 'LO5',
        type: 'order',
        kind: 'level',
        tree: TREES.uneven,
        prompt: 'Click the nodes in LEVEL-ORDER.',
        hints: ['Depth 0: 40. Depth 1: 20, 60. Depth 2: …'],
        explain: 'Level-order: 40, 20, 60, 10, 30, 50, 70, 25.',
      },
      {
        id: 'm5q4',
        lo: 'LO5',
        type: 'mcq',
        prompt: 'Recursive pre-order traversal does not create a stack in the code. Which stack does it use?',
        options: ['None, recursion needs no memory', "The program's call stack", 'A hidden queue', 'The heap'],
        answer: 1,
        hints: ['Every function call that has not returned yet is stored somewhere.'],
        explain: 'Each active recursive call is a frame on the call stack, so depth first traversal is stack based.',
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
    sections: [
      {
        type: 'compare',
        title: 'Same keys, different shapes',
        items: [
          { tree: fromKeys([4, 2, 6, 1, 3, 5, 7]), caption: 'Inserted 4, 2, 6, 1, 3, 5, 7. Balanced: height 2.' },
          {
            tree: fromKeys([1, 2, 3, 4, 5, 6, 7]),
            caption: 'Inserted 1, 2, 3, 4, 5, 6, 7. A degenerate chain: height 6.',
          },
        ],
      },
      {
        type: 'text',
        title: 'Cost depends on height',
        body: (
          <>
            <p>
              Search and insert follow <strong>one path</strong> from the root, so they take at most{' '}
              <strong>h + 1</strong> comparisons, where <em>h</em> is the height.
            </p>
            <ul>
              <li>
                <strong>Balanced</strong> tree: h ≈ log₂ n. With 1 000 000 keys that is only about 20 comparisons, so{' '}
                <strong>O(log n)</strong>.
              </li>
              <li>
                <strong>Degenerate</strong> tree, for example from sorted input: h = n − 1, no better than a linked
                list, so <strong>O(n)</strong>.
              </li>
            </ul>
            <p>
              A <strong>traversal</strong> always visits all n nodes, so it is <strong>O(n)</strong> whatever the shape.
            </p>
            <p className="aside">
              Self-balancing trees (AVL, red-black) keep the height O(log n) automatically. You will meet them later in
              COS212.
            </p>
          </>
        ),
      },
      {
        type: 'try',
        title: 'Your turn',
        question: {
          id: 'm6-try',
          lo: 'LO6',
          type: 'mcq',
          tree: fromKeys([1, 2, 3, 4, 5, 6, 7]),
          prompt: 'How many comparisons does a search for 7 take in this tree?',
          options: ['1', '3', '4', '7'],
          answer: 3,
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
                <td>visits by depth</td>
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
        prompt: 'What is the worst case number of comparisons to search a degenerate (chain shaped) BST with n nodes?',
        options: ['1', 'about log₂ n', 'n', 'n²'],
        answer: 2,
        hints: ['In a chain, each node has only one child. How long is the only path?'],
        explain: 'The path can contain all n nodes, so search is O(n).',
      },
      {
        id: 'm6q2',
        lo: 'LO6',
        type: 'mcq',
        prompt: 'What is the time complexity of an in-order traversal of a BST with n nodes?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 2,
        hints: ['A traversal visits every node exactly once.'],
        explain: "Every node is visited once, so traversal is O(n), regardless of the tree's shape.",
      },
      {
        id: 'm6q3',
        lo: 'LO6',
        type: 'mcq',
        prompt:
          'You want to safely delete every node of a tree, and each node may only be removed after its children. Which traversal fits?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
        answer: 2,
        hints: ['Children must be finished BEFORE the parent.'],
        explain: 'Post-order handles both subtrees before the node itself.',
      },
      {
        id: 'm6q4',
        lo: 'LO6',
        type: 'mcq',
        prompt: 'A perfectly balanced BST holds 15 keys. What is its height, in edges?',
        options: ['3', '4', '7', '14'],
        answer: 0,
        hints: ['Levels hold 1, 2, 4, 8 nodes.', '1 + 2 + 4 + 8 = 15, so 4 levels. How many edges from top to bottom?'],
        explain: '15 nodes fill 4 levels (1 + 2 + 4 + 8), so the height is 3 edges.',
      },
      {
        id: 'm6q5',
        lo: 'LO6',
        type: 'mcq',
        prompt: 'Which insertion order produces the most balanced BST for the keys 1 to 7?',
        options: ['1, 2, 3, 4, 5, 6, 7', '7, 6, 5, 4, 3, 2, 1', '4, 2, 6, 1, 3, 5, 7', '1, 7, 2, 6, 3, 5, 4'],
        answer: 2,
        hints: ['A good root splits the remaining keys in half.'],
        explain: 'Inserting the middle key (4) first, then the middles of each half, gives a perfectly balanced tree.',
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
