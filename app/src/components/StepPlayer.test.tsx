import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fromKeys } from '../engine/bst'
import { STORAGE_KEY, useProgress, type Mode } from '../state/progress'
import { ProgressProvider } from '../state/ProgressProvider'
import { StepPlayer } from './StepPlayer'

const balanced = fromKeys([50, 30, 70, 20, 40, 60, 80])

function ModeSwitch() {
  const { progress, update } = useProgress()
  const to: Mode = progress.mode === 'guided' ? 'standard' : 'guided'
  return (
    <button type="button" onClick={() => update({ mode: to })}>
      switch to {to}
    </button>
  )
}

function setup(mode: Mode) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode }))
  render(
    <ProgressProvider>
      <ModeSwitch />
      <StepPlayer tree={balanced} kind="search" keyValue={45} />
    </ProgressProvider>,
  )
  return { user: userEvent.setup(), next: screen.getByRole('button', { name: 'Next step' }) }
}

const narration = () => document.querySelector('.narration')!
const activeLine = () => document.querySelector('.code .is-active')

afterEach(() => localStorage.clear())

describe('StepPlayer in standard mode', () => {
  it('shows only the steps that change something, without reasons or notes', async () => {
    const { user, next } = setup('standard')
    expect(narration()).toHaveTextContent('Step 1 of 4')
    expect(narration()).toHaveTextContent('45 < 50, so the key can only be in the LEFT subtree.')
    expect(activeLine()).toHaveTextContent('if (key < node.key) return search(node.left, key);')
    expect(screen.getByText('Standard: key steps')).toBeInTheDocument()
    await user.click(next)
    expect(screen.queryByText('Why:')).not.toBeInTheDocument()
    expect(document.querySelector('.code-note')).toBeNull()
    expect(document.querySelector('.tree-note')).toBeNull()
  })
})

describe('StepPlayer in guided mode', () => {
  it('walks every line, explains it, labels the current node and says why', async () => {
    const { user, next } = setup('guided')
    expect(narration()).toHaveTextContent('Step 1 of 10')
    expect(narration()).toHaveTextContent('Look at node 50. It is not null, so compare.')
    expect(activeLine()).toHaveTextContent('if (node == null) return null;')
    expect(document.querySelector('.code-note')).toHaveTextContent('Line 2.')
    expect(document.querySelector('.tree-note')).toHaveTextContent('45?')
    await user.click(next)
    await user.click(next)
    expect(narration()).toHaveTextContent(
      'Why: Every key in the right subtree of 50 is bigger than 50, so 45 cannot be there.',
    )
    expect(screen.getByText('Guided: every line, with reasons')).toBeInTheDocument()
  })

  it('restarts at step 1 when the learner switches mode', async () => {
    const { user, next } = setup('guided')
    await user.click(next)
    await user.click(next)
    await user.click(screen.getByRole('button', { name: 'switch to standard' }))
    expect(narration()).toHaveTextContent('Step 1 of 4')
  })
})

describe('StepPlayer narration', () => {
  it('reads each step aloud when the learner turns it on, and stops when the player goes away', async () => {
    const said: string[] = []
    const cancel = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak: (u: { text: string }) => said.push(u.text), cancel })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string
        constructor(text: string) {
          this.text = text
        }
      },
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: 'standard', narrate: true }))
    const { unmount } = render(
      <ProgressProvider>
        <StepPlayer tree={balanced} kind="search" keyValue={45} />
      </ProgressProvider>,
    )
    expect(said).toEqual(['45 < 50, so the key can only be in the LEFT subtree.'])
    await userEvent.setup().click(screen.getByRole('button', { name: 'Next step' }))
    expect(said.at(-1)).toBe('45 > 30, so the key can only be in the RIGHT subtree.')
    unmount()
    expect(cancel).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
