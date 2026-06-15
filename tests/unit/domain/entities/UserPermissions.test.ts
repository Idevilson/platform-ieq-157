import { describe, it, expect } from 'vitest'
import { User } from '@/server/domain/user/entities/User'
import { PermissionDef } from '@/server/domain/permission/entities/PermissionDef'
import { UserRole } from '@/server/domain/shared/types'

function makeUser(role: UserRole, permissions?: unknown) {
  return User.restore(
    'u1',
    'u@x.com',
    { nome: 'Maria', role, criadoEm: new Date(), atualizadoEm: new Date() },
    '52998224725',
    permissions as never,
  )
}

describe('User.hasPermission (escopo por evento)', () => {
  it('admin tem todas as permissões em qualquer evento', () => {
    const admin = makeUser('admin')
    expect(admin.hasPermission('confirm-cash', 'geracao-forte')).toBe(true)
    expect(admin.hasPermission('qualquer-coisa')).toBe(true)
  })

  it('usuário escopado: true só no evento do escopo', () => {
    const user = makeUser('user', [{ key: 'confirm-cash', eventIds: ['geracao-forte'] }])
    expect(user.hasPermission('confirm-cash', 'geracao-forte')).toBe(true)
    expect(user.hasPermission('confirm-cash', 'startup')).toBe(false)
  })

  it('escopo global (*) vale para qualquer evento', () => {
    const user = makeUser('user', [{ key: 'deliver-kits', eventIds: ['*'] }])
    expect(user.hasPermission('deliver-kits', 'qualquer')).toBe(true)
    expect(user.hasPermission('deliver-kits')).toBe(true)
  })

  it('sem eventId só passa em grant global', () => {
    const user = makeUser('user', [{ key: 'confirm-cash', eventIds: ['geracao-forte'] }])
    expect(user.hasPermission('confirm-cash')).toBe(false)
  })

  it('retrocompat: permissão legada string[] vira global', () => {
    const user = makeUser('user', ['adm-q4-news'])
    expect(user.hasPermission('adm-q4-news')).toBe(true)
    expect(user.hasPermission('adm-q4-news', 'geracao-forte')).toBe(true)
  })

  it('nega permissão que não possui', () => {
    const user = makeUser('user', [{ key: 'deliver-kits', eventIds: ['*'] }])
    expect(user.hasPermission('confirm-cash', 'geracao-forte')).toBe(false)
  })
})

describe('User.grant/revoke (idempotente)', () => {
  it('grant é upsert por chave', () => {
    const user = makeUser('user')
    user.grantPermission('deliver-kits', ['geracao-forte'])
    user.grantPermission('deliver-kits', ['startup'])
    expect(user.permissions).toEqual([{ key: 'deliver-kits', eventIds: ['startup'] }])
  })

  it('grant sem eventos vira global', () => {
    const user = makeUser('user')
    user.grantPermission('confirm-cash', [])
    expect(user.hasPermission('confirm-cash', 'x')).toBe(true)
  })

  it('revoke remove e é idempotente', () => {
    const user = makeUser('user', [{ key: 'deliver-kits', eventIds: ['*'] }])
    user.revokePermission('deliver-kits')
    user.revokePermission('deliver-kits')
    expect(user.permissions).toEqual([])
  })

  it('permissionIndex achata key:eventId', () => {
    const user = makeUser('user', [
      { key: 'deliver-kits', eventIds: ['geracao-forte', 'startup'] },
      { key: 'confirm-cash', eventIds: ['*'] },
    ])
    expect(user.permissionIndex.sort()).toEqual(
      ['confirm-cash:*', 'deliver-kits:geracao-forte', 'deliver-kits:startup'].sort(),
    )
  })
})

describe('PermissionDef', () => {
  it('valida chave e rótulo', () => {
    expect(() => PermissionDef.create({ key: 'Deliver Kits', label: 'x', system: false })).toThrow('Chave')
    expect(() => PermissionDef.create({ key: 'deliver-kits', label: ' ', system: false })).toThrow('rótulo')
  })

  it('updateLabel não muda chave nem system', () => {
    const def = PermissionDef.create({ key: 'check-in', label: 'Check-in', system: false })
    def.updateLabel('Portaria', 'Faz o check-in')
    const json = def.toJSON()
    expect(json.key).toBe('check-in')
    expect(json.label).toBe('Portaria')
    expect(json.system).toBe(false)
  })
})
