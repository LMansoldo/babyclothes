import { describe, expect, it } from 'vitest'
import { LoginInputSchema } from '$lib/domain/user/schemas'

describe('EmailLoginForm validation (LoginInputSchema)', () => {
  it('accepts valid email and password', () => {
    const result = LoginInputSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ email: 'user@example.com', password: 'secret123' })
    }
  })

  it('rejects invalid email', () => {
    const result = LoginInputSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = LoginInputSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('trims email whitespace', () => {
    const result = LoginInputSchema.safeParse({
      email: '  user@example.com  ',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('user@example.com')
    }
  })
})
