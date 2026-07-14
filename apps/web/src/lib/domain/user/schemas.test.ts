import { describe, expect, it } from 'vitest'
import { LoginInputSchema } from './schemas'

describe('LoginInputSchema', () => {
  it('accepts valid email and password', () => {
    const result = LoginInputSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects email without @', () => {
    const result = LoginInputSchema.safeParse({
      email: 'userexample.com',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.email_invalid')
    }
  })

  it('rejects empty password', () => {
    const result = LoginInputSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.password_required')
    }
  })
})
