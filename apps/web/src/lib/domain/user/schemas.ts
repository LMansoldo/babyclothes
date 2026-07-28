import { z } from 'zod'
import { isValidCpf, stripDocument } from './value-objects/Document'
import { stripDigits } from './value-objects/Contact'

export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const RegisterPFStep1Schema = z.object({
  name: z.string().trim().min(2, 'validation.name_required').max(120),
  email: z.string().trim().email('validation.email_invalid').max(254),
  password: z.string().min(8, 'validation.password_min').max(72),
  cpf: z.string().transform(stripDocument).refine(isValidCpf, 'validation.cpf_invalid'),
})

export const RegisterPFStep2Schema = z.object({
  phone: z
    .string()
    .transform(stripDigits)
    .refine((v) => v.length === 10 || v.length === 11, 'validation.phone_invalid'),
  nationality: z.string().trim().min(2, 'validation.nationality_required').max(60),
  cep: z.string().transform(stripDigits).refine((v) => v.length === 8, 'validation.cep_invalid'),
  addressLine: z.string().trim().min(4, 'validation.address_required').max(160),
  city: z.string().trim().min(2, 'validation.city_required').max(80),
  state: z.string().refine((v) => (UF_LIST as readonly string[]).includes(v), 'validation.state_required'),
})

export const RegisterPFInputSchema = RegisterPFStep1Schema.merge(RegisterPFStep2Schema)
export type RegisterPFInput = z.infer<typeof RegisterPFInputSchema>

export const LoginInputSchema = z.object({
  email: z.string().trim().email('validation.email_invalid').max(254),
  password: z.string().min(1, 'validation.password_required').max(72),
})

export type LoginInput = z.infer<typeof LoginInputSchema>
