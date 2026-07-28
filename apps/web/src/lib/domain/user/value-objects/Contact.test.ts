import { describe, expect, it } from 'vitest'
import { stripDigits, formatPhone, formatCep } from './Contact'

describe('stripDigits', () => {
  it('removes all non-digit characters', () => {
    expect(stripDigits('(11) 98765-4321')).toBe('11987654321')
  })

  it('returns empty string for no digits', () => {
    expect(stripDigits('abc-')).toBe('')
  })

  it('returns digits unchanged', () => {
    expect(stripDigits('12345')).toBe('12345')
  })
})

describe('formatPhone', () => {
  it('formats 10-digit phone (landline)', () => {
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890')
  })

  it('formats 11-digit phone (mobile)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('formats partial input progressively', () => {
    expect(formatPhone('1')).toBe('1')
    expect(formatPhone('11')).toBe('11')
    expect(formatPhone('119')).toBe('(11) 9')
    expect(formatPhone('1198')).toBe('(11) 98')
    expect(formatPhone('11987')).toBe('(11) 987')
    expect(formatPhone('119876')).toBe('(11) 9876')
    expect(formatPhone('1198765')).toBe('(11) 9876-5')
    expect(formatPhone('11987654')).toBe('(11) 9876-54')
    expect(formatPhone('119876543')).toBe('(11) 9876-543')
    expect(formatPhone('1198765432')).toBe('(11) 9876-5432')
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('strips non-digit characters from input', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })

  it('is idempotent on already masked value', () => {
    const masked = '(11) 98765-4321'
    expect(formatPhone(masked)).toBe(masked)
  })

  it('truncates to 11 digits', () => {
    expect(formatPhone('119876543210000')).toBe('(11) 98765-4321')
  })
})

describe('formatCep', () => {
  it('returns partial CEP without dash when <= 5 digits', () => {
    expect(formatCep('01310')).toBe('01310')
    expect(formatCep('013')).toBe('013')
    expect(formatCep('0')).toBe('0')
  })

  it('formats complete 8-digit CEP with dash', () => {
    expect(formatCep('01310100')).toBe('01310-100')
  })

  it('formats masked input idempotently', () => {
    expect(formatCep('01310-100')).toBe('01310-100')
  })

  it('strips non-digit characters', () => {
    expect(formatCep('01310-100abc')).toBe('01310-100')
  })

  it('truncates to 8 digits', () => {
    expect(formatCep('013101009999')).toBe('01310-100')
  })
})
