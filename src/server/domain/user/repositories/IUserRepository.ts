
import { User } from '../entities/User'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByCPF(cpf: string): Promise<User | null>
  list(): Promise<User[]>
  findByPermissionIndexAny(values: string[]): Promise<User[]>
  save(user: User): Promise<void>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
