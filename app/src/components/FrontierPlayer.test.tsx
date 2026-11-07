import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { fromKeys } from '../engine/bst'
import { ProgressProvider } from '../state/ProgressProvider'
import { FrontierPlayer } from './FrontierPlayer'

const tree = fromKeys([50, 30, 70, 20, 40, 60, 80, 45, 65])

const listed = (name: RegExp) => {
  const list = screen.queryByRole('list', { name })
  return list
    ? within(list)
        .queryAllByRole('listitem')
        .map((li) => li.textContent)
    : []
}

const narration = () => document.querySelector('.narration')!

function setup() {
  render(
    <ProgressProvider>
      <FrontierPlayer tree={tree} />
    </ProgressProvider>,
  )
  return { user: userEvent.setup(), next: screen.getByRole('button', { name: 'Next step' }) }
}

afterEach(() => localStorage.clear())

describe('FrontierPlayer', () => {
  it('opens on the start state with only the root waiting', () => {
    setup()
    expect(narration()).toHaveTextContent('Start: add the root (50) to the queue.')
    expect(listed(/queue/i)).toEqual(['50'])
    expect(listed(/visit order/i)).toEqual([])
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
  })

  it('takes a node out, visits it, then adds its children, each as its own step', async () => {
    const { user, next } = setup()
    await user.click(next)
    expect(narration()).toHaveTextContent('Take 50 from the front of the queue.')
    expect(listed(/queue/i)).toEqual([])
    await user.click(next)
    expect(listed(/visit order/i)).toEqual(['50'])
    await user.click(next)
    expect(listed(/queue/i)).toEqual(['30', '70'])
    expect(document.querySelector('.code .is-active')).toHaveTextContent('frontier.addChildren(node);')
  })

  it('restarts and lists the stack top first after switching to depth first', async () => {
    const { user, next } = setup()
    await user.click(next)
    await user.click(screen.getByRole('radio', { name: /depth first/i }))
    expect(narration()).toHaveTextContent('Step 1 of')
    const stackNext = screen.getByRole('button', { name: 'Next step' })
    for (let i = 0; i < 3; i++) await user.click(stackNext)
    expect(listed(/stack/i)).toEqual(['30', '70'])
    expect(narration()).toHaveTextContent("Push 50's children, right 70 first, then left 30, so 30 is on top.")
  })

  it('steps back to the previous state', async () => {
    const { user, next } = setup()
    for (let i = 0; i < 3; i++) await user.click(next)
    await user.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(listed(/queue/i)).toEqual([])
    expect(listed(/visit order/i)).toEqual(['50'])
  })

  it('disables Next once every node is visited, and Restart goes back to the start', async () => {
    const { user, next } = setup()
    while (!(next as HTMLButtonElement).disabled) await user.click(next)
    expect(narration()).toHaveTextContent(
      'The queue is empty, so the loop stops. Visit order: 50, 30, 70, 20, 40, 60, 80, 45, 65.',
    )
    await user.click(screen.getByRole('button', { name: 'Restart' }))
    expect(listed(/visit order/i)).toEqual([])
  })
})
