import { describe, it, expect, beforeEach } from 'vitest'
import { PermissionDef } from '@/server/domain/permission/entities/PermissionDef'
import { IPermissionRepository } from '@/server/domain/permission/repositories/IPermissionRepository'
import { User } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { CreatePermission, UpdatePermission, DeletePermission, ListPermissions } from '@/server/application/permission/PermissionCatalog'
import { ListUsers, SetUserPermissions } from '@/server/application/user/AdminUserManagement'
import { ListEventTeam } from '@/server/application/user/ListEventTeam'
import { UserRole } from '@/server/domain/shared/types'
import { UserPermissionGrant } from '@/shared/constants'

function permissionRepo(seed: PermissionDef[] = []): IPermissionRepository {
  const map = new Map(seed.map((p) => [p.key, p]))
  return {
    list: async () => [...map.values()],
    findByKey: async (key) => map.get(key) ?? null,
    upsert: async (p) => { map.set(p.key, p) },
    delete: async (key) => { map.delete(key) },
  }
}

function makeUser(id: string, nome: string, role: UserRole, grants?: UserPermissionGrant[]) {
  return User.restore(id, `${id}@x.com`, { nome, role, criadoEm: new Date(), atualizadoEm: new Date() }, undefined, grants)
}

function userRepo(users: User[]): IUserRepository {
  const map = new Map(users.map((u) => [u.toJSON().id, u]))
  return {
    findById: async (id) => map.get(id) ?? null,
    findByEmail: async () => null,
    findByCPF: async () => null,
    list: async () => [...map.values()],
    findByPermissionIndexAny: async (values) =>
      [...map.values()].filter((u) => u.permissionIndex.some((p) => values.includes(p))),
    save: async () => {},
    update: async (u) => { map.set(u.toJSON().id, u) },
    delete: async () => {},
  }
}

describe('Catálogo de permissões', () => {
  it('cria permissão custom e bloqueia chave duplicada', async () => {
    const repo = permissionRepo()
    await new CreatePermission(repo).execute({ key: 'check-in', label: 'Check-in' })
    expect((await new ListPermissions(repo).execute()).permissions).toHaveLength(1)
    await expect(new CreatePermission(repo).execute({ key: 'check-in', label: 'X' })).rejects.toThrow('Já existe')
  })

  it('criar com chave de sistema marca system=true (protege exclusão)', async () => {
    const repo = permissionRepo()
    const out = await new CreatePermission(repo).execute({ key: 'deliver-kits', label: 'Entregar kits' })
    expect(out.permission.system).toBe(true)
    await expect(new DeletePermission(repo).execute('deliver-kits')).rejects.toThrow('sistema')
  })

  it('update altera rótulo; delete bloqueado p/ sistema', async () => {
    const sys = PermissionDef.create({ key: 'confirm-cash', label: 'Caixa', system: true })
    const repo = permissionRepo([sys])
    await new UpdatePermission(repo).execute({ key: 'confirm-cash', label: 'Caixa do evento' })
    expect((await repo.findByKey('confirm-cash'))?.label).toBe('Caixa do evento')
    await expect(new DeletePermission(repo).execute('confirm-cash')).rejects.toThrow('sistema')
  })
})

describe('Gestão de usuários', () => {
  let users: User[]
  beforeEach(() => {
    users = [makeUser('u1', 'Maria Souza', 'user'), makeUser('u2', 'João Lima', 'user')]
  })

  it('busca por nome', async () => {
    const out = await new ListUsers(userRepo(users)).execute({ query: 'maria' })
    expect(out.users.map((u) => u.id)).toEqual(['u1'])
  })

  it('SetUserPermissions substitui os grants (idempotente)', async () => {
    const repo = userRepo(users)
    const uc = new SetUserPermissions(repo)
    await uc.execute({ targetUserId: 'u1', grants: [{ key: 'deliver-kits', eventIds: ['geracao-forte'] }] })
    const out = await uc.execute({ targetUserId: 'u1', grants: [{ key: 'confirm-cash', eventIds: ['*'] }] })
    expect(out.user.permissions).toEqual([{ key: 'confirm-cash', eventIds: ['*'] }])
  })
})

describe('ListEventTeam (derivado)', () => {
  it('lista quem tem permissão de operação no evento', async () => {
    const users = [
      makeUser('u1', 'Maria', 'user', [{ key: 'deliver-kits', eventIds: ['geracao-forte'] }, { key: 'confirm-cash', eventIds: ['geracao-forte'] }]),
      makeUser('u2', 'João', 'user', [{ key: 'deliver-kits', eventIds: ['*'] }]),
      makeUser('u3', 'Ana', 'user', [{ key: 'confirm-cash', eventIds: ['startup'] }]),
    ]
    const out = await new ListEventTeam(userRepo(users)).execute({ eventId: 'geracao-forte' })
    const byId = Object.fromEntries(out.team.map((m) => [m.userId, m.permissions.sort()]))
    expect(byId['u1']).toEqual(['confirm-cash', 'deliver-kits'])
    expect(byId['u2']).toEqual(['deliver-kits'])
    expect(byId['u3']).toBeUndefined()
  })
})
