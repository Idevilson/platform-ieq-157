import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { Event } from '@/server/domain/event/entities/Event'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { Gender } from '@/shared/constants'
import type { InscriptionWithDetails } from './ListEventInscriptions'

export async function toInscriptionWithDetails(
  inscription: Inscription,
  event: Event,
  userRepository: IUserRepository,
): Promise<InscriptionWithDetails> {
  const category = event.getCategory(inscription.categoryId)
  const pending = inscription.pendingUpgrade

  let nome = ''
  let email = ''
  let cpf = ''
  let telefone = ''
  let sexo: Gender | undefined

  if (inscription.guestData) {
    nome = inscription.guestData.nome
    email = inscription.guestData.email.getValue()
    cpf = inscription.guestData.cpf.getValue()
    telefone = inscription.guestData.telefone.getValue()
    sexo = inscription.guestData.sexo.toJSON()
  } else if (inscription.userId) {
    const user = await userRepository.findById(inscription.userId)
    if (user) {
      const userData = user.toJSON()
      nome = userData.nome
      email = userData.email
      cpf = userData.cpf || ''
      telefone = userData.telefone || ''
      sexo = userData.sexo
    }
  }

  return {
    id: inscription.id,
    eventId: inscription.eventId,
    eventTitulo: event.titulo,
    categoryId: inscription.categoryId,
    categoryNome: category?.nome || '',
    categoryValor: category?.valorCents || 0,
    nome,
    email,
    cpf,
    telefone,
    sexo,
    cidade: inscription.guestData?.cidade,
    status: inscription.status,
    statusLabel: inscription.statusLabel,
    valor: inscription.valorCents,
    valorFormatado: inscription.valorFormatado,
    paymentId: inscription.paymentId,
    preferredPaymentMethod: inscription.preferredPaymentMethod,
    tamanho: inscription.tamanho,
    temBrinde: inscription.temBrinde,
    perkId: inscription.perkId,
    brindeAlocadoEm: inscription.brindeAlocadoEm,
    confirmadoPorNome: inscription.confirmadoPorNome,
    confirmadoEm: inscription.confirmadoEm,
    kitDeliveries: inscription.toJSON().kitDeliveries,
    pendingUpgrade: pending
      ? {
          targetCategoryId: pending.targetCategoryId,
          targetCategoryNome: event.getCategory(pending.targetCategoryId)?.nome || '',
          targetValorCents: pending.targetValorCents,
          diferencaBaseCents: pending.diferencaBaseCents,
          adjustmentPaymentId: pending.adjustmentPaymentId,
          metodo: pending.metodo,
        }
      : undefined,
    criadoEm: inscription.criadoEm,
    atualizadoEm: inscription.atualizadoEm,
  }
}
