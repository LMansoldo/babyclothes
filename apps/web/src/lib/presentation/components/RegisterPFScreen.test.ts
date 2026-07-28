import { describe, expect, it } from 'vitest'
import { RegisterPFStep1Schema, RegisterPFInputSchema } from '$lib/domain/user/schemas'

describe('RegisterPFScreen step 1 validation', () => {
  it('rejects empty name', () => {
    const result = RegisterPFStep1Schema.safeParse({
      name: '',
      email: 'maria@example.com',
      password: 'senha-forte-123',
      cpf: '52998224725',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = RegisterPFStep1Schema.safeParse({
      name: 'Maria Clara',
      email: 'not-an-email',
      password: 'senha-forte-123',
      cpf: '52998224725',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = RegisterPFStep1Schema.safeParse({
      name: 'Maria Clara',
      email: 'maria@example.com',
      password: '1234567',
      cpf: '52998224725',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid CPF', () => {
    const result = RegisterPFStep1Schema.safeParse({
      name: 'Maria Clara',
      email: 'maria@example.com',
      password: 'senha-forte-123',
      cpf: '11111111111',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid step 1 with masked CPF', () => {
    const result = RegisterPFStep1Schema.safeParse({
      name: 'Maria Clara Santos',
      email: 'maria@example.com',
      password: 'senha-forte-123',
      cpf: '529.982.247-25',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cpf).toBe('52998224725')
    }
  })
})

describe('RegisterPFScreen full form validation', () => {
  const validFull = {
    name: 'Maria Clara Santos',
    email: 'maria@example.com',
    password: 'senha-forte-123',
    cpf: '52998224725',
    phone: '(11) 98765-4321',
    nationality: 'Brasileira',
    cep: '01310-100',
    addressLine: 'Av. Paulista, 1000, ap 12',
    city: 'Sao Paulo',
    state: 'SP',
  }

  it('accepts all valid fields with masks', () => {
    const result = RegisterPFInputSchema.safeParse(validFull)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('11987654321')
      expect(result.data.cep).toBe('01310100')
      expect(result.data.cpf).toBe('52998224725')
    }
  })

  it('rejects when step 1 field is missing', () => {
    const { email, ...rest } = validFull
    const result = RegisterPFInputSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects when step 2 field is missing', () => {
    const { phone, ...rest } = validFull
    const result = RegisterPFInputSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone (9 digits)', () => {
    const result = RegisterPFInputSchema.safeParse({ ...validFull, phone: '119876543' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid state', () => {
    const result = RegisterPFInputSchema.safeParse({ ...validFull, state: 'XX' })
    expect(result.success).toBe(false)
  })
})
