import { describe, it, expect } from 'vitest'
import { Condition } from './Condition'

describe('Condition', () => {
  it('accepts new', () => {
    expect(new Condition('new').value).toBe('new')
  })

  it('accepts like_new', () => {
    expect(new Condition('like_new').value).toBe('like_new')
  })

  it('accepts used', () => {
    expect(new Condition('used').value).toBe('used')
  })

  it('throws on invalid condition', () => {
    // @ts-expect-error — testing runtime
    expect(() => new Condition('broken')).toThrow('Invalid condition: broken')
  })
})
