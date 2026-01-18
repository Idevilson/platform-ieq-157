import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateProfile } from '@/server/application/user/UpdateProfile'
import { User } from '@/server/domain/user/entities/User'
import type { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'

describe('UpdateProfile', () => {
  let updateProfile: UpdateProfile
  let mockUserRepository: IUserRepository
  let existingUser: User

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByCPF: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    existingUser = User.create({
      id: 'user-123',
      email: 'test@example.com',
      nome: 'Test User',
      role: 'user',
    })

    updateProfile = new UpdateProfile(mockUserRepository)
  })

  it('should update user profile successfully', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(mockUserRepository.findByCPF).mockResolvedValue(null)
    vi.mocked(mockUserRepository.update).mockResolvedValue(undefined)

    const result = await updateProfile.execute({
      userId: 'user-123',
      nome: 'Updated Name',
      cpf: '52998224725',
      telefone: '11999999999',
    })

    expect(result.user.nome).toBe('Updated Name')
    expect(result.user.cpf).toBe('52998224725')
    expect(result.user.telefone).toBe('11999999999')
    expect(mockUserRepository.update).toHaveBeenCalled()
  })

  it('should throw error when user not found', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

    await expect(
      updateProfile.execute({
        userId: 'non-existent',
        nome: 'New Name',
      })
    ).rejects.toThrow()
  })

  it('should throw error when CPF is already in use by another user', async () => {
    const otherUser = User.create({
      id: 'other-user',
      email: 'other@example.com',
      nome: 'Other User',
      cpf: '52998224725',
      role: 'user',
    })

    vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(mockUserRepository.findByCPF).mockResolvedValue(otherUser)

    await expect(
      updateProfile.execute({
        userId: 'user-123',
        cpf: '52998224725',
      })
    ).rejects.toThrow()
  })

  it('should allow same user to keep their CPF', async () => {
    const userWithCPF = User.create({
      id: 'user-123',
      email: 'test@example.com',
      nome: 'Test User',
      cpf: '52998224725',
      role: 'user',
    })

    vi.mocked(mockUserRepository.findById).mockResolvedValue(userWithCPF)
    vi.mocked(mockUserRepository.findByCPF).mockResolvedValue(userWithCPF)
    vi.mocked(mockUserRepository.update).mockResolvedValue(undefined)

    const result = await updateProfile.execute({
      userId: 'user-123',
      cpf: '52998224725',
      nome: 'New Name',
    })

    expect(result.user.cpf).toBe('52998224725')
    expect(result.user.nome).toBe('New Name')
  })

  it('should validate CPF format', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser)

    await expect(
      updateProfile.execute({
        userId: 'user-123',
        cpf: '12345678900', // Invalid CPF
      })
    ).rejects.toThrow()
  })

  it('should allow partial updates', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(mockUserRepository.update).mockResolvedValue(undefined)

    const result = await updateProfile.execute({
      userId: 'user-123',
      nome: 'Only Name Updated',
    })

    expect(result.user.nome).toBe('Only Name Updated')
  })
})
