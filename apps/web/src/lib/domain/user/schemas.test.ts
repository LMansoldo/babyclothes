import { describe, expect, it } from 'vitest'
import { LoginInputSchema, RegisterPFStep1Schema, RegisterPFStep2Schema, RegisterPFInputSchema } from './schemas'

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

describe('RegisterPFStep1Schema', () => {
  const validStep1 = {
    name: 'Maria Clara Santos',
    email: 'maria@example.com',
    password: 'senha-forte-123',
    cpf: '529.982.247-25',
  }

  it('accepts valid complete step 1 data', () => {
    const result = RegisterPFStep1Schema.safeParse(validStep1)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cpf).toBe('52998224725')
    }
  })

  it('accepts CPF with mask and strips it', () => {
    const result = RegisterPFStep1Schema.safeParse({ ...validStep1, cpf: '529.982.247-25' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cpf).toBe('52998224725')
    }
  })

  it('rejects invalid CPF (all same digit)', () => {
    const result = RegisterPFStep1Schema.safeParse({ ...validStep1, cpf: '111.111.111-11' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.cpf_invalid')
    }
  })

  it('rejects email without @', () => {
    const result = RegisterPFStep1Schema.safeParse({ ...validStep1, email: 'mariaexample.com' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.email_invalid')
    }
  })

  it('rejects password with 7 chars', () => {
    const result = RegisterPFStep1Schema.safeParse({ ...validStep1, password: '1234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.password_min')
    }
  })

  it('rejects name shorter than 2 chars', () => {
    const result = RegisterPFStep1Schema.safeParse({ ...validStep1, name: 'M' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.name_required')
    }
  })
})

describe('RegisterPFStep2Schema', () => {
  const validStep2 = {
    phone: '(11) 98765-4321',
    nationality: 'Brasileira',
    cep: '01310-100',
    addressLine: 'Av. Paulista, 1000, ap 12',
    city: 'Sao Paulo',
    state: 'SP',
  }

  it('accepts valid complete step 2 data', () => {
    const result = RegisterPFStep2Schema.safeParse(validStep2)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('11987654321')
      expect(result.data.cep).toBe('01310100')
    }
  })

  it('accepts masked phone and strips digits', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, phone: '(11) 98765-4321' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('11987654321')
    }
  })

  it('rejects phone with 9 digits', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, phone: '119876543' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.phone_invalid')
    }
  })

  it('accepts masked CEP and strips digits', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, cep: '01310-100' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cep).toBe('01310100')
    }
  })

  it('rejects CEP with 7 digits', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, cep: '0131010' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.cep_invalid')
    }
  })

  it('rejects invalid state UF', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, state: 'XX' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.state_required')
    }
  })

  it('rejects address shorter than 4 chars', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, addressLine: 'Rua' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.address_required')
    }
  })

  it('rejects empty city', () => {
    const result = RegisterPFStep2Schema.safeParse({ ...validStep2, city: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.city_required')
    }
  })
})

describe('RegisterPFInputSchema', () => {
  const validFull = {
    name: 'Maria Clara Santos',
    email: 'maria@example.com',
    password: 'senha-forte-123',
    cpf: '52998224725',
    phone: '11987654321',
    nationality: 'Brasileira',
    cep: '01310100',
    addressLine: 'Av. Paulista, 1000, ap 12',
    city: 'Sao Paulo',
    state: 'SP',
  }

  it('accepts all 10 fields valid', () => {
    const result = RegisterPFInputSchema.safeParse(validFull)
    expect(result.success).toBe(true)
  })

  it('rejects when a step 1 field is missing', () => {
    const { name, ...rest } = validFull
    const result = RegisterPFInputSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects when a step 2 field is missing', () => {
    const { phone, ...rest } = validFull
    const result = RegisterPFInputSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
