import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { fromKeys } from '../engine/bst'
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

function setup() {
  render(<FrontierPlayer tree={tree} />)
  return { user: userEvent.setup(), next: screen.getByRole('button', { name: 'Next step' }) }
}

describe('FrontierPlayer', () => {
  it('opens on the start state with only the root waiting', () => {
    setup()
    expect(screen.getByRole('status')).toHaveTextContent('Start. Queue holds 50.')
    expect(listed(/queue/i)).toEqual(['50'])
    expect(listed(/visit order/i)).toEqual([])
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('shows the queue front first while walking breadth first', async () => {
    const { user, next } = setup()
    await user.click(next)
    await user.click(next)
    expect(listed(/visit order/i)).toEqual(['50', '30'])
    expect(listed(/queue/i)).toEqual(['70', '20', '40'])
    expect(screen.getByRole('status')).toHaveTextContent('Visited 30. Queue: 70, 20, 40.')
  })

  it('restarts and shows the stack top first after switching to depth first', async () => {
    const { user, next } = setup()
    await user.click(next)
    await user.click(screen.getByRole('radio', { name: /depth first/i }))
    expect(screen.getByText('Step 0 of 9')).toBeInTheDocument()
    await user.click(next)
    await user.click(next)
    expect(listed(/stack/i)).toEqual(['20', '40', '70'])
  })

  it('steps back to the previous state', async () => {
    const { user, next } = setup()
    await user.click(next)
    await user.click(next)
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(listed(/visit order/i)).toEqual(['50'])
  })

  it('disables Next once every node is visited and restarts from the beginning', async () => {
    const { user, next } = setup()
    for (let i = 0; i < 9; i++) await user.click(next)
    expect(next).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Visited 65. Queue: empty.')
    await user.click(screen.getByRole('button', { name: 'Restart' }))
    expect(listed(/visit order/i)).toEqual([])
  })
})
