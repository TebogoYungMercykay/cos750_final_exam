import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fromKeys } from '../engine/bst'
import { TreeView } from './TreeView'

const viewBox = (container: HTMLElement) =>
  container.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number)

describe('TreeView notes', () => {
  it('widens a small tree so a long label is never cut off', () => {
    const { container } = render(<TreeView tree={fromKeys([8])} label="One node" notes={() => '100 < 200, go right'} />)
    const [, , width] = viewBox(container)
    const rect = container.querySelector('.tree-note rect')!
    const x = Number(rect.getAttribute('x'))
    expect(x).toBeGreaterThanOrEqual(0)
    expect(x + Number(rect.getAttribute('width'))).toBeLessThanOrEqual(width)
  })

  it('keeps the same height whether or not this step has a label', () => {
    const tree = fromKeys([50, 30, 70])
    const labelled = render(<TreeView tree={tree} label="With a label" notes={(k) => (k === 50 ? 'root' : null)} />)
    const unlabelled = render(<TreeView tree={tree} label="Without one" notes={() => null} />)
    expect(viewBox(labelled.container)[3]).toBe(viewBox(unlabelled.container)[3])
  })
})
