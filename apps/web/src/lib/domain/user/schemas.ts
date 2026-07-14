import { z } from 'zod'

export const LoginInputSchema = z.object({
  email: z.string().trim().email('validation.email_invalid').max(254),
  password: z.string().min(1, 'validation.password_required').max(72),
})

export type LoginInput = z.infer<typeof LoginInputSchema>
