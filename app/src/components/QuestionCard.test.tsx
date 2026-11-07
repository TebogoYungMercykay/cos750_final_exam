import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fromKeys } from '../engine/bst'
import type { Answer, Question } from '../content/types'
import { ProgressProvider } from '../state/ProgressProvider'
import { QuestionCard } from './QuestionCard'

const mcq: Question = {
  id: 'q1',
  lo: 'LO2',
  type: 'mcq',
  prompt: 'Which key may sit in the right subtree of 50?',
  options: ['12', '49', '73'],
  answer: 2,
  feedback: ['12 < 50, so 12 belongs on the left.', '49 < 50, so 49 belongs on the left.', ''],
  bloom: 'Understand',
  hints: ['Right means larger.'],
  explain: 'Only larger keys go right.',
}

const order: Question = {
  id: 'q2',
  lo: 'LO4',
  type: 'order',
  kind: 'pre',
  tree: fromKeys([2, 1, 3]),
  bloom: 'Apply',
  prompt: 'Click the nodes in PRE-ORDER.',
  hints: ['The root is first.'],
  explain: 'Pre-order: 2, 1, 3.',
}

function setup(question: Question) {
  const onDone = vi.fn<(a: Answer) => void>()
  render(
    <ProgressProvider>
      <QuestionCard question={question} onDone={onDone} />
    </ProgressProvider>,
  )
  return { user: userEvent.setup(), onDone }
}

afterEach(() => localStorage.clear())

describe('QuestionCard', () => {
  it('gives full credit for a clean first answer', async () => {
    const { user, onDone } = setup(mcq)
    await user.click(screen.getByRole('button', { name: /73/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Correct. Only larger keys go right.')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 1, mistakes: 0, revealed: false }))
  })

  it('shows the hint after a mistake and gives partial credit', async () => {
    const { user, onDone } = setup(mcq)
    await user.click(screen.getByRole('button', { name: /12/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Not quite. 12 < 50, so 12 belongs on the left.')
    expect(screen.getByText(/Right means larger/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /12/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /73/ }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 0.6, mistakes: 1 }))
  })

  it('offers the answer only after three mistakes, for no credit', async () => {
    const { user, onDone } = setup(order)
    const node = (k: number) => screen.getByRole('button', { name: `Node ${k}` })
    await user.click(node(1))
    await user.click(node(3))
    expect(screen.queryByRole('button', { name: /show me the answer/i })).not.toBeInTheDocument()
    await user.click(node(1))
    await user.click(screen.getByRole('button', { name: /show me the answer/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Pre-order: 2, 1, 3.')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 0, revealed: true }))
  })

  it('accepts a traversal clicked in the right order', async () => {
    const { user, onDone } = setup(order)
    for (const k of [2, 1, 3]) await user.click(screen.getByRole('button', { name: `Node ${k}` }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 1 }))
  })
})
