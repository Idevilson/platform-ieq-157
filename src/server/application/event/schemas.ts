import { z } from 'zod'

const dateLike = z.string().or(z.date()).transform((val) => {
  const date = typeof val === 'string' ? new Date(val) : val
  if (isNaN(date.getTime())) {
    throw new Error('Data invalida')
  }
  return date
})

export const createCategorySchema = z.object({
  nome: z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres'),
  valor: z.number().int().min(0, 'Valor deve ser maior ou igual a zero'),
  descricao: z.string().optional(),
  ordem: z.number().int().optional(),
  earlyBirdValor: z.number().int().min(0).optional(),
  earlyBirdDeadline: dateLike.optional(),
  beneficiosInclusos: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.earlyBirdValor !== undefined && data.earlyBirdDeadline === undefined) return false
    if (data.earlyBirdDeadline !== undefined && data.earlyBirdValor === undefined) return false
    return true
  },
  { message: 'earlyBirdValor e earlyBirdDeadline devem ser informados juntos' },
).refine(
  (data) => data.earlyBirdValor === undefined || data.earlyBirdValor < data.valor,
  { message: 'earlyBirdValor deve ser menor que valor', path: ['earlyBirdValor'] },
)

export const createPerkSchema = z.object({
  nome: z.string().min(2, 'Nome do brinde deve ter pelo menos 2 caracteres'),
  descricao: z.string().min(2),
  limiteEstoque: z.number().int().positive('limiteEstoque deve ser positivo'),
  categoriaId: z.string().nullable().optional(),
})

export type CreatePerkInput = z.infer<typeof createPerkSchema>

// Create event schema
export const createEventSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minusculas, numeros e hifens').optional(),
  titulo: z.string().min(3, 'Titulo deve ter pelo menos 3 caracteres'),
  subtitulo: z.string().optional(),
  descricao: z.string().min(10, 'Descricao deve ter pelo menos 10 caracteres'),
  descricaoCompleta: z.string().optional(),
  dataInicio: z.string().or(z.date()).transform((val) => {
    const date = typeof val === 'string' ? new Date(val) : val
    if (isNaN(date.getTime())) {
      throw new Error('Data de inicio invalida')
    }
    return date
  }),
  dataFim: z.string().or(z.date()).optional().transform((val) => {
    if (!val) return undefined
    const date = typeof val === 'string' ? new Date(val) : val
    if (isNaN(date.getTime())) {
      throw new Error('Data de fim invalida')
    }
    return date
  }),
  local: z.string().min(3, 'Local deve ter pelo menos 3 caracteres'),
  endereco: z.string().min(5, 'Endereco deve ter pelo menos 5 caracteres'),
  googleMapsUrl: z.string().url('URL do Google Maps invalida').optional().or(z.literal('')),
  whatsappContato: z.string().optional(),
  metodosPagamento: z.array(z.enum(['PIX', 'BOLETO', 'CREDIT_CARD', 'CASH'])).min(1, 'Pelo menos um metodo de pagamento deve ser informado'),
  imagemUrl: z.string().optional(),
  categorias: z.array(createCategorySchema).optional(),
}).refine((data) => {
  if (data.dataFim && data.dataFim < data.dataInicio) {
    return false
  }
  return true
}, {
  message: 'Data de fim nao pode ser anterior a data de inicio',
  path: ['dataFim'],
})

// Change event slug schema
export const changeEventSlugSchema = z.object({
  eventId: z.string().min(1, 'ID do evento e obrigatorio'),
  newSlug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minusculas, numeros e hifens'),
})

export type ChangeEventSlugInput = z.infer<typeof changeEventSlugSchema>

// Update event status schema
export const updateEventStatusSchema = z.object({
  eventId: z.string().min(1, 'ID do evento e obrigatorio'),
  status: z.enum(['rascunho', 'aberto', 'fechado', 'encerrado', 'cancelado'], {
    error: 'Status invalido',
  }),
})

// Types inferred from schemas
export type CreateEventInput = z.input<typeof createEventSchema>
export type CreateEventParsed = z.output<typeof createEventSchema>
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>
