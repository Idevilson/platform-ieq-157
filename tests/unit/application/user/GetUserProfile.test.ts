import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetUserProfile } from '@/server/application/user/GetUserProfile'
import { User } from '@/server/domain/user/entities/User'
import type { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'

describe('GetUserProfile', () => {
  let getUserProfile: GetUserProfile
  let mockUserRepository: IUserRepository

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByCPF: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    getUserProfile = new GetUserProfile(mockUserRepository)
  })

  it('should return user profile when found', async () => {
    const user = User.create({
      id: 'user-123',
      email: 'test@example.com',
      nome: 'Test User',
      cpf: '52998224725',
      telefone: '11999999999',
      role: 'user',
    })

    vi.mocked(mockUserRepository.findById).mockResolvedValue(user)

    const result = await getUserProfile.execute({ userId: 'user-123' })

    expect(result.user).toBeDefined()
    expect(result.user.id).toBe('user-123')
    expect(result.user.email).toBe('test@example.com')
    expect(result.user.nome).toBe('Test User')
    expect(result.user.cpf).toBe('52998224725')
    expect(result.user.telefone).toBe('11999999999')
  })

  it('should throw error when user not found', async () => {
    vi.mocked(mockUserRepository.findById).mockResolvedValue(null)

    await expect(
      getUserProfile.execute({ userId: 'non-existent' })
    ).rejects.toThrow()
  })

  it('should call repository with correct userId', async () => {
    const user = User.create({
      id: 'test-user-id',
      email: 'test@example.com',
      nome: 'Test User',
      role: 'user',
    })

    vi.mocked(mockUserRepository.findById).mockResolvedValue(user)

    await getUserProfile.execute({ userId: 'test-user-id' })

    expect(mockUserRepository.findById).toHaveBeenCalledWith('test-user-id')
  })

  it('should return user without optional fields', async () => {
    const user = User.create({
      id: 'user-123',
      email: 'test@example.com',
      nome: 'Test User',
      role: 'user',
    })

    vi.mocked(mockUserRepository.findById).mockResolvedValue(user)

    const result = await getUserProfile.execute({ userId: 'user-123' })

    expect(result.user).toBeDefined()
    expect(result.user.cpf).toBeUndefined()
    expect(result.user.telefone).toBeUndefined()
  })

  it('should return admin user correctly', async () => {
    const adminUser = User.create({
      id: 'admin-123',
      email: 'admin@example.com',
      nome: 'Admin User',
      role: 'admin',
    })

    vi.mocked(mockUserRepository.findById).mockResolvedValue(adminUser)

    const result = await getUserProfile.execute({ userId: 'admin-123' })

    expect(result.user.role).toBe('admin')
  })
})
