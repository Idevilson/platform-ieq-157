import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SetUserChurch } from '@/server/application/user/SetUserChurch'
import { ClearUserChurch } from '@/server/application/user/ClearUserChurch'
import { AdminRemoveUserFromChurch } from '@/server/application/user/AdminRemoveUserFromChurch'
import { Church } from '@/server/domain/church/entities/Church'
import {
  ChurchInactiveError,
  ChurchNotFoundError,
  UserNotFoundError,
  UserNotLinkedToChurchError,
  ValidationError,
} from '@/server/domain/shared/errors'

function makeUser(churchId: string | null) {
  return {
    getChurchId: () => churchId,
  }
}

function makeChurch(opts: { id: string; ativo: boolean }) {
  return Church.fromPersistence({
    id: opts.id,
    nome: opts.id.toUpperCase(),
    slug: opts.id,
    ativo: opts.ativo,
    totalMembros: 0,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  })
}

describe('SetUserChurch', () => {
  let userRepository: any
  let churchRepository: any
  let useCase: SetUserChurch

  beforeEach(() => {
    userRepository = { findById: vi.fn() }
    churchRepository = { findById: vi.fn(), transferUserChurch: vi.fn() }
    useCase = new SetUserChurch(userRepository, churchRepository)
  })

  it('vincula usuário sem igreja a uma igreja ativa (transação A→B com A=null)', async () => {
    userRepository.findById.mockResolvedValue(makeUser(null))
    churchRepository.findById.mockResolvedValue(makeChurch({ id: 'sede', ativo: true }))

    await useCase.execute('user-1', { churchId: 'sede' })

    expect(churchRepository.transferUserChurch).toHaveBeenCalledWith({
      userId: 'user-1',
      oldChurchId: null,
      newChurchId: 'sede',
    })
  })

  it('troca a igreja de um usuário já vinculado (A→B)', async () => {
    userRepository.findById.mockResolvedValue(makeUser('sede'))
    churchRepository.findById.mockResolvedValue(makeChurch({ id: 'filial', ativo: true }))

    await useCase.execute('user-1', { churchId: 'filial' })

    expect(churchRepository.transferUserChurch).toHaveBeenCalledWith({
      userId: 'user-1',
      oldChurchId: 'sede',
      newChurchId: 'filial',
    })
  })

  it('no-op quando user já está na mesma igreja', async () => {
    userRepository.findById.mockResolvedValue(makeUser('sede'))
    churchRepository.findById.mockResolvedValue(makeChurch({ id: 'sede', ativo: true }))

    await useCase.execute('user-1', { churchId: 'sede' })

    expect(churchRepository.transferUserChurch).not.toHaveBeenCalled()
  })

  it('lança ChurchInactiveError ao tentar vincular a igreja inativa', async () => {
    userRepository.findById.mockResolvedValue(makeUser(null))
    churchRepository.findById.mockResolvedValue(makeChurch({ id: 'sede', ativo: false }))

    await expect(useCase.execute('user-1', { churchId: 'sede' })).rejects.toBeInstanceOf(
      ChurchInactiveError
    )
  })

  it('lança ChurchNotFoundError se igreja inexistente', async () => {
    userRepository.findById.mockResolvedValue(makeUser(null))
    churchRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute('user-1', { churchId: 'inexistente' })).rejects.toBeInstanceOf(
      ChurchNotFoundError
    )
  })

  it('lança UserNotFoundError quando user inexistente', async () => {
    userRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute('user-1', { churchId: 'sede' })).rejects.toBeInstanceOf(
      UserNotFoundError
    )
  })

  it('lança ValidationError com churchId vazio', async () => {
    await expect(useCase.execute('user-1', { churchId: '' })).rejects.toBeInstanceOf(
      ValidationError
    )
  })
})

describe('ClearUserChurch', () => {
  let userRepository: any
  let churchRepository: any
  let useCase: ClearUserChurch

  beforeEach(() => {
    userRepository = { findById: vi.fn() }
    churchRepository = { transferUserChurch: vi.fn() }
    useCase = new ClearUserChurch(userRepository, churchRepository)
  })

  it('desvincula usuário vinculado', async () => {
    userRepository.findById.mockResolvedValue(makeUser('sede'))
    await useCase.execute('user-1')
    expect(churchRepository.transferUserChurch).toHaveBeenCalledWith({
      userId: 'user-1',
      oldChurchId: 'sede',
      newChurchId: null,
    })
  })

  it('no-op se já sem vínculo', async () => {
    userRepository.findById.mockResolvedValue(makeUser(null))
    await useCase.execute('user-1')
    expect(churchRepository.transferUserChurch).not.toHaveBeenCalled()
  })

  it('UserNotFoundError se user inexistente', async () => {
    userRepository.findById.mockResolvedValue(null)
    await expect(useCase.execute('nope')).rejects.toBeInstanceOf(UserNotFoundError)
  })
})

describe('AdminRemoveUserFromChurch', () => {
  let userRepository: any
  let churchRepository: any
  let useCase: AdminRemoveUserFromChurch

  beforeEach(() => {
    userRepository = { findById: vi.fn() }
    churchRepository = { transferUserChurch: vi.fn() }
    useCase = new AdminRemoveUserFromChurch(userRepository, churchRepository)
  })

  it('remove vínculo corretamente quando user pertence à igreja', async () => {
    userRepository.findById.mockResolvedValue(makeUser('sede'))
    await useCase.execute('user-1', 'sede')
    expect(churchRepository.transferUserChurch).toHaveBeenCalledWith({
      userId: 'user-1',
      oldChurchId: 'sede',
      newChurchId: null,
    })
  })

  it('lança UserNotLinkedToChurchError se user não está na igreja alvo', async () => {
    userRepository.findById.mockResolvedValue(makeUser('outra'))
    await expect(useCase.execute('user-1', 'sede')).rejects.toBeInstanceOf(
      UserNotLinkedToChurchError
    )
  })

  it('lança UserNotLinkedToChurchError se user sem vínculo', async () => {
    userRepository.findById.mockResolvedValue(makeUser(null))
    await expect(useCase.execute('user-1', 'sede')).rejects.toBeInstanceOf(
      UserNotLinkedToChurchError
    )
  })
})
