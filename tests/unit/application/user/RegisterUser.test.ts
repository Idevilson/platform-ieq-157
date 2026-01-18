import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RegisterUser } from '@/server/application/user/RegisterUser'
import { User } from '@/server/domain/user/entities/User'
import type { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'

describe('RegisterUser', () => {
  let registerUser: RegisterUser
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

    registerUser = new RegisterUser(mockUserRepository)
  })

  it('should register a new user successfully', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(mockUserRepository.save).mockResolvedValue(undefined)

    const result = await registerUser.execute({
      uid: 'firebase-uid-123',
      email: 'test@example.com',
      nome: 'Test User',
    })

    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('test@example.com')
    expect(result.user.nome).toBe('Test User')
    expect(result.user.role).toBe('user')
    expect(mockUserRepository.save).toHaveBeenCalled()
  })

  it('should throw error when email already exists in database', async () => {
    const existingUser = User.create({
      id: 'existing-user-id',
      email: 'test@example.com',
      nome: 'Existing User',
      role: 'user',
    })

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser)

    await expect(
      registerUser.execute({
        uid: 'new-uid',
        email: 'test@example.com',
        nome: 'New User',
      })
    ).rejects.toThrow()
  })

  it('should validate email format', async () => {
    await expect(
      registerUser.execute({
        uid: 'uid-123',
        email: 'invalid-email',
        nome: 'Test User',
      })
    ).rejects.toThrow()
  })

  it('should use uid as user id', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(mockUserRepository.save).mockResolvedValue(undefined)

    const result = await registerUser.execute({
      uid: 'firebase-uid-456',
      email: 'user@example.com',
      nome: 'User Name',
    })

    expect(result.user.id).toBe('firebase-uid-456')
  })

  it('should set default role as user', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(mockUserRepository.save).mockResolvedValue(undefined)

    const result = await registerUser.execute({
      uid: 'uid-123',
      email: 'test@example.com',
      nome: 'Test User',
    })

    expect(result.user.role).toBe('user')
  })
})
