import { z } from 'zod'

export const createPaymentForInscriptionSchema = z.object({
  eventId: z.string().min(1),
  inscriptionId: z.string().min(1),
  metodo: z.enum(['PIX', 'CREDIT_CARD']).default('PIX'),
  parcelas: z.number().int().min(1).max(12).optional(),
})

export type CreatePaymentForInscriptionInput = z.infer<typeof createPaymentForInscriptionSchema>
