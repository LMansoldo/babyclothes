import { writable, derived, get } from 'svelte/store'
import {
  RegisterPFStep1Schema,
  RegisterPFStep2Schema,
  RegisterPFInputSchema,
  type RegisterPFInput,
} from '$lib/domain/user/schemas'
import { formatCpf } from '$lib/domain/user/value-objects/Document'
import { formatPhone, formatCep } from '$lib/domain/user/value-objects/Contact'

// ── Types ──────────────────────────────────────────────

export type Step = 1 | 2
export type FieldName = keyof RegisterPFInput

interface FieldState {
  value: string
  error: string | null
  touched: boolean
}

export interface RegisterFormState {
  step: Step
  fields: Record<FieldName, FieldState>
  submitting: boolean
  serverError: string | null
  serverFieldErrors: Partial<Record<FieldName, string>>
}

// ── Helpers ────────────────────────────────────────────

function createField(value = ''): FieldState {
  return { value, error: null, touched: false }
}

const STEP1_FIELDS: FieldName[] = ['name', 'email', 'password', 'cpf']
const STEP2_FIELDS: FieldName[] = ['phone', 'nationality', 'cep', 'addressLine', 'city', 'state']

// ── Per-field validators ───────────────────────────────

const fieldValidators: Record<FieldName, (value: string) => string | null> = {
  name: (v) => {
    if (v.trim().length < 2) return 'validation.name_required'
    if (v.length > 120) return 'validation.name_required'
    return null
  },
  email: (v) => {
    if (!v.trim()) return 'validation.email_invalid'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'validation.email_invalid'
    if (v.length > 254) return 'validation.email_invalid'
    return null
  },
  password: (v) => {
    if (v.length < 8) return 'validation.password_min'
    if (v.length > 72) return 'validation.password_min'
    return null
  },
  cpf: (v) => {
    const digits = v.replace(/\D/g, '')
    if (digits.length !== 11) return 'validation.cpf_invalid'
    // All same digit check
    if (/^(\d)\1+$/.test(digits)) return 'validation.cpf_invalid'
    // Checksum
    const numbers = digits.split('').map(Number)
    const first = cpfChecksum(numbers.slice(0, 9), 10)
    const second = cpfChecksum([...numbers.slice(0, 9), first], 11)
    if (first !== numbers[9] || second !== numbers[10]) return 'validation.cpf_invalid'
    return null
  },
  phone: (v) => {
    const digits = v.replace(/\D/g, '')
    if (digits.length !== 10 && digits.length !== 11) return 'validation.phone_invalid'
    return null
  },
  nationality: (v) => {
    if (v.trim().length < 2) return 'validation.nationality_required'
    if (v.length > 60) return 'validation.nationality_required'
    return null
  },
  cep: (v) => {
    const digits = v.replace(/\D/g, '')
    if (digits.length !== 8) return 'validation.cep_invalid'
    return null
  },
  addressLine: (v) => {
    if (v.trim().length < 4) return 'validation.address_required'
    if (v.length > 160) return 'validation.address_required'
    return null
  },
  city: (v) => {
    if (v.trim().length < 2) return 'validation.city_required'
    if (v.length > 80) return 'validation.city_required'
    return null
  },
  state: (v) => {
    const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
    if (!ufs.includes(v)) return 'validation.state_required'
    return null
  },
}

function cpfChecksum(numbers: number[], initialWeight: number): number {
  const sum = numbers.reduce((acc, digit, index) => acc + digit * (initialWeight - index), 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

// ── Store factory ──────────────────────────────────────

export function createRegisterFormStore() {
  const initialState: RegisterFormState = {
    step: 1,
    fields: {
      name: createField(),
      email: createField(),
      password: createField(),
      cpf: createField(),
      phone: createField(),
      nationality: createField('Brasileira'),
      cep: createField(),
      addressLine: createField(),
      city: createField(),
      state: createField(),
    },
    submitting: false,
    serverError: null,
    serverFieldErrors: {},
  }

  const { subscribe, update, set } = writable<RegisterFormState>(initialState)

  // ── Field value setters (with optional formatting) ───

  function setField(field: FieldName, value: string) {
    update((s) => ({
      ...s,
      fields: { ...s.fields, [field]: { ...s.fields[field], value } },
    }))
  }

  function setFormattedCpf(raw: string) {
    setField('cpf', formatCpf(raw))
  }

  function setFormattedPhone(raw: string) {
    setField('phone', formatPhone(raw))
  }

  function setFormattedCep(raw: string) {
    setField('cep', formatCep(raw))
  }

  // ── Validation ───────────────────────────────────────

  function validateField(field: FieldName): boolean {
    let valid = true
    update((s) => {
      const value = s.fields[field].value
      const error = fieldValidators[field](value)
      if (error) valid = false
      return {
        ...s,
        fields: { ...s.fields, [field]: { ...s.fields[field], error, touched: true } },
      }
    })
    return valid
  }

  function validateStep1(): boolean {
    let allValid = true
    update((s) => {
      const newFields = { ...s.fields }
      for (const field of STEP1_FIELDS) {
        const error = fieldValidators[field](newFields[field].value)
        newFields[field] = { ...newFields[field], error, touched: true }
        if (error) allValid = false
      }
      return { ...s, fields: newFields }
    })
    return allValid
  }

  function validateStep2(): boolean {
    let allValid = true
    update((s) => {
      const newFields = { ...s.fields }
      for (const field of STEP2_FIELDS) {
        const error = fieldValidators[field](newFields[field].value)
        newFields[field] = { ...newFields[field], error, touched: true }
        if (error) allValid = false
      }
      return { ...s, fields: newFields }
    })
    return allValid
  }

  function validateAll(): boolean {
    let allValid = true
    update((s) => {
      const newFields = { ...s.fields }
      for (const field of [...STEP1_FIELDS, ...STEP2_FIELDS]) {
        const error = fieldValidators[field](newFields[field].value)
        newFields[field] = { ...newFields[field], error, touched: true }
        if (error) allValid = false
      }
      return { ...s, fields: newFields }
    })
    return allValid
  }

  // ── Blur handler ─────────────────────────────────────

  function handleBlur(field: FieldName) {
    update((s) => {
      const value = s.fields[field].value
      const error = s.fields[field].touched ? fieldValidators[field](value) : null
      return {
        ...s,
        fields: { ...s.fields, [field]: { ...s.fields[field], error, touched: true } },
      }
    })
  }

  // ── Step navigation ──────────────────────────────────

  function goToStep2(): boolean {
    if (!validateStep1()) return false
    update((s) => ({ ...s, step: 2 }))
    return true
  }

  function goToStep1() {
    update((s) => ({ ...s, step: 1 }))
  }

  // ── Submit ───────────────────────────────────────────

  function collectData(): RegisterPFInput | null {
    const state = get({ subscribe })
    const raw: Record<string, string> = {}
    for (const field of [...STEP1_FIELDS, ...STEP2_FIELDS]) {
      raw[field] = state.fields[field].value
    }
    const parsed = RegisterPFInputSchema.safeParse(raw)
    if (!parsed.success) {
      // Map errors to fields
      update((s) => {
        const newFields = { ...s.fields }
        for (const issue of parsed.error.issues) {
          const field = String(issue.path[0]) as FieldName
          if (newFields[field]) {
            newFields[field] = { ...newFields[field], error: issue.message, touched: true }
          }
        }
        return { ...s, fields: newFields }
      })
      return null
    }
    return parsed.data
  }

  // ── Server error handling ────────────────────────────

  function setServerErrors(errors: Partial<Record<FieldName, string>>) {
    update((s) => {
      const newFields = { ...s.fields }
      let shouldGoToStep1 = false
      for (const [field, message] of Object.entries(errors)) {
        if (newFields[field as FieldName]) {
          newFields[field as FieldName] = {
            ...newFields[field as FieldName],
            error: message,
            touched: true,
          }
          if (STEP1_FIELDS.includes(field as FieldName)) shouldGoToStep1 = true
        }
      }
      return {
        ...s,
        fields: newFields,
        step: shouldGoToStep1 ? 1 : s.step,
        serverFieldErrors: errors,
      }
    })
  }

  function setSubmitting(submitting: boolean) {
    update((s) => ({ ...s, submitting }))
  }

  function setServerError(error: string | null) {
    update((s) => ({ ...s, serverError: error }))
  }

  function clearFieldError(field: FieldName) {
    update((s) => ({
      ...s,
      fields: { ...s.fields, [field]: { ...s.fields[field], error: null } },
    }))
  }

  // ── Derived stores ───────────────────────────────────

  const step = derived({ subscribe }, ($s) => $s.step)
  const fields = derived({ subscribe }, ($s) => $s.fields)
  const submitting = derived({ subscribe }, ($s) => $s.submitting)
  const serverError = derived({ subscribe }, ($s) => $s.serverError)

  return {
    subscribe,
    step,
    fields,
    submitting,
    serverError,
    setField,
    setFormattedCpf,
    setFormattedPhone,
    setFormattedCep,
    validateField,
    validateStep1,
    validateStep2,
    validateAll,
    handleBlur,
    goToStep2,
    goToStep1,
    collectData,
    setServerErrors,
    setSubmitting,
    setServerError,
    clearFieldError,
    reset: () => set(initialState),
  }
}

export type RegisterFormStore = ReturnType<typeof createRegisterFormStore>
