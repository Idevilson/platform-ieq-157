import { z } from 'zod'

export const createNewsPostSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minusculas, numeros e hifens').optional(),
  titulo: z.string().min(3, 'Titulo deve ter pelo menos 3 caracteres'),
  descricao: z.string().min(10, 'Resumo deve ter pelo menos 10 caracteres'),
  conteudo: z.string().min(20, 'Conteudo deve ter pelo menos 20 caracteres'),
  youtubeUrl: z.string().url('URL do YouTube invalida'),
  status: z.enum(['rascunho', 'publicado']).default('rascunho'),
})

export const updateNewsPostSchema = z.object({
  titulo: z.string().min(3).optional(),
  descricao: z.string().min(10).optional(),
  conteudo: z.string().min(20).optional(),
  youtubeUrl: z.string().url().optional(),
  status: z.enum(['rascunho', 'publicado']).optional(),
})

export type CreateNewsPostInput = z.infer<typeof createNewsPostSchema>
export type UpdateNewsPostInput = z.infer<typeof updateNewsPostSchema>
