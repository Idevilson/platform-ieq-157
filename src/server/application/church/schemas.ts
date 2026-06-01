import { z } from 'zod'

const slugSchema = z
  .string()
  .min(3, 'Slug deve ter pelo menos 3 caracteres')
  .max(60, 'Slug deve ter no máximo 60 caracteres')
  .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')

export const createChurchSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: slugSchema.optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'UF deve ter 2 letras').optional(),
})

export const updateChurchSchema = z.object({
  nome: z.string().min(2).optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  ativo: z.boolean().optional(),
})

export const listChurchesSchema = z.object({
  ativo: z.boolean().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

export const listChurchMembersSchema = z.object({
  churchId: z.string().min(1),
  search: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().min(0).optional(),
})

export const setUserChurchSchema = z.object({
  churchId: z.string().min(1, 'churchId é obrigatório'),
})

export type CreateChurchInput = z.infer<typeof createChurchSchema>
export type UpdateChurchInput = z.infer<typeof updateChurchSchema>
export type ListChurchesInput = z.infer<typeof listChurchesSchema>
export type ListChurchMembersInput = z.infer<typeof listChurchMembersSchema>
export type SetUserChurchInput = z.infer<typeof setUserChurchSchema>
