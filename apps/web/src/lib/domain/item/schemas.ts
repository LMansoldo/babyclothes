import { z } from 'zod'

const VALID_SIZES = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8'] as const

export const CreateItemInputSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(120),
  description: z.string().max(1000).optional().default(''),
  category: z.string().min(1, 'Categoria é obrigatória'),
  gender: z.enum(['male', 'female', 'unisex']),
  clothingSize: z.enum(VALID_SIZES, {
    errorMap: () => ({ message: `Tamanho inválido. Válidos: ${VALID_SIZES.join(', ')}` }),
  }),
  condition: z.enum(['new', 'like_new', 'used']),
  priceCents: z.number().int().min(0, 'Preço não pode ser negativo'),
})

export type CreateItemInput = z.infer<typeof CreateItemInputSchema>
