import { z } from 'zod'

// Category schema
export const createCategorySchema = z.object({
  nome: z.string().min(2, 'Nome da categoria deve ter pelo menos 2 caracteres'),
  valor: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
  descricao: z.string().optional(),
})

// Create event schema
export const createEventSchema = z.object({
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
  metodosPagamento: z.array(z.enum(['PIX', 'BOLETO', 'CREDIT_CARD'])).min(1, 'Pelo menos um metodo de pagamento deve ser informado'),
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
