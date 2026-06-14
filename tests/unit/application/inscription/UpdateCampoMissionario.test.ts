import { describe, it, expect, vi } from 'vitest'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { UpdateCampoMissionario } from '@/server/application/inscription/UpdateCampoMissionario'

function guestInscription() {
  return Inscription.fromPersistence({
    id: 'insc-guest',
    eventId: 'geracao-forte',
    categoryId: 'redencao',
    valor: 12000,
    status: 'confirmado',
    preferredPaymentMethod: 'PIX',
    guestData: {
      nome: 'Maria',
      email: 'maria@x.com',
      telefone: '11999998888',
      cpf: '52998224725',
      dataNascimento: new Date('1990-01-01'),
      sexo: 'feminino',
    },
    criadoEm: new Date('2026-05-01'),
    atualizadoEm: new Date('2026-05-01'),
  })
}

function userInscription() {
  return Inscription.fromPersistence({
    id: 'insc-user',
    eventId: 'geracao-forte',
    categoryId: 'redencao',
    userId: 'user-1',
    valor: 12000,
    status: 'confirmado',
    preferredPaymentMethod: 'PIX',
    criadoEm: new Date('2026-05-01'),
    atualizadoEm: new Date('2026-05-01'),
  })
}

function makeUseCase(inscription: Inscription) {
  const repo = {
    findById: vi.fn(async () => inscription),
    update: vi.fn(async () => {}),
  }
  return { uc: new UpdateCampoMissionario(repo as never), repo }
}

const base = { inscriptionId: 'x', eventId: 'geracao-forte', campoMissionario: '157' }

describe('UpdateCampoMissionario — autorização', () => {
  it('visitante (guest) atualiza sem login', async () => {
    const insc = guestInscription()
    const { uc, repo } = makeUseCase(insc)
    await uc.execute({ ...base, userId: undefined })
    expect(insc.campoMissionario).toBe('157')
    expect(repo.update).toHaveBeenCalledOnce()
  })

  it('inscrição de conta NÃO pode ser alterada anonimamente', async () => {
    const { uc } = makeUseCase(userInscription())
    await expect(uc.execute({ ...base, userId: undefined })).rejects.toThrow('Acesso negado')
  })

  it('inscrição de conta pode ser alterada pelo próprio dono', async () => {
    const insc = userInscription()
    const { uc } = makeUseCase(insc)
    await uc.execute({ ...base, userId: 'user-1' })
    expect(insc.campoMissionario).toBe('157')
  })

  it('inscrição de conta nega outro usuário', async () => {
    const { uc } = makeUseCase(userInscription())
    await expect(uc.execute({ ...base, userId: 'outro' })).rejects.toThrow('Acesso negado')
  })

  it('rejeita valor não numérico', async () => {
    const { uc } = makeUseCase(guestInscription())
    await expect(uc.execute({ ...base, campoMissionario: '15a', userId: undefined })).rejects.toThrow('apenas números')
  })
})
