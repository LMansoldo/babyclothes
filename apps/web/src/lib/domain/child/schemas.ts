import { z } from 'zod'

const VALID_SIZES = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8'] as const

export const CreateChildInputSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(80),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  birthWeightG: z.number().int().min(0, 'Peso não pode ser negativo'),
  birthHeightCm: z.number().int().min(0, 'Altura não pode ser negativa'),
})

export const MeasurementInputSchema = z.object({
  weightG: z.number().int().min(0),
  heightCm: z.number().int().min(0),
  clothingSize: z.enum(VALID_SIZES),
  recordedAt: z.string().datetime({ offset: true }).optional(),
})

export type CreateChildInput = z.infer<typeof CreateChildInputSchema>
export type MeasurementInput = z.infer<typeof MeasurementInputSchema>
