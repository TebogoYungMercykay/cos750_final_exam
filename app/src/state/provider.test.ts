import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useProgress } from './progress'

describe('useProgress', () => {
  it('says what is missing when used outside the provider', () => {
    expect(() => renderHook(() => useProgress())).toThrow('useProgress needs a ProgressProvider above it')
  })
})
