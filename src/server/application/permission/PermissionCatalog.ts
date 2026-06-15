import { PermissionDef } from '@/server/domain/permission/entities/PermissionDef'
import { IPermissionRepository } from '@/server/domain/permission/repositories/IPermissionRepository'
import { ValidationError } from '@/server/domain/shared/errors'
import { SYSTEM_PERMISSIONS } from '@/shared/constants'

export interface UpsertPermissionInput {
  key: string
  label: string
  description?: string
}

function isSystemKey(key: string): boolean {
  return SYSTEM_PERMISSIONS.some((p) => p.key === key)
}

export class ListPermissions {
  constructor(private readonly repository: IPermissionRepository) {}

  async execute() {
    const permissions = await this.repository.list()
    return { permissions: permissions.map((p) => p.toJSON()) }
  }
}

export class CreatePermission {
  constructor(private readonly repository: IPermissionRepository) {}

  async execute(input: UpsertPermissionInput) {
    const def = PermissionDef.create({ ...input, system: isSystemKey(input.key.trim()) })
    const existing = await this.repository.findByKey(def.key)
    if (existing) throw new ValidationError('Já existe uma permissão com essa chave')
    await this.repository.upsert(def)
    return { permission: def.toJSON() }
  }
}

export class UpdatePermission {
  constructor(private readonly repository: IPermissionRepository) {}

  async execute(input: UpsertPermissionInput) {
    const def = await this.repository.findByKey(input.key)
    if (!def) throw new ValidationError('Permissão não encontrada')
    def.updateLabel(input.label, input.description)
    await this.repository.upsert(def)
    return { permission: def.toJSON() }
  }
}

export class DeletePermission {
  constructor(private readonly repository: IPermissionRepository) {}

  async execute(key: string) {
    const def = await this.repository.findByKey(key)
    if (!def) return { deleted: false }
    if (def.system) throw new ValidationError('Permissão de sistema não pode ser removida')
    await this.repository.delete(key)
    return { deleted: true }
  }
}
