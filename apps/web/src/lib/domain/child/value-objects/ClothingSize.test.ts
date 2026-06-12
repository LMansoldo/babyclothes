import { describe, it, expect } from 'vitest'
import { ClothingSize } from './ClothingSize'

describe('ClothingSize', () => {
  const validSizes = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8']

  it.each(validSizes)('accepts valid size %s', (size) => {
    const cs = new ClothingSize(size)
    expect(cs.value).toBe(size)
    expect(cs.validate()).toBe(true)
  })

  it('throws on invalid size', () => {
    expect(() => new ClothingSize('XL')).toThrow('Invalid clothing size: XL')
    expect(() => new ClothingSize('')).toThrow()
    expect(() => new ClothingSize('5')).toThrow('Invalid clothing size: 5')
  })

  it('next() returns the next size in sequence', () => {
    expect(new ClothingSize('RN').next().value).toBe('P')
    expect(new ClothingSize('P').next().value).toBe('M')
    expect(new ClothingSize('M').next().value).toBe('G')
    expect(new ClothingSize('GG').next().value).toBe('1')
    expect(new ClothingSize('8').next().value).toBe('8')
  })

  it('is immutable — same value equals same value', () => {
    const a = new ClothingSize('M')
    const b = new ClothingSize('M')
    expect(a.value).toBe(b.value)
  })
})
