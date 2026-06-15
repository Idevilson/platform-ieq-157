import { formatCPF } from '@/lib/formatters'
import { Gender, GLOBAL_PERMISSION_SCOPE, UserPermissionGrant } from '@/shared/constants'

export interface UserDocument {
  email: string
  nome: string
  telefone?: string
  cpf?: string
  dataNascimento?: { toDate: () => Date }
  sexo?: Gender
  role: string
  permissions?: string[] | UserPermissionGrant[]
  criadoEm?: { toDate: () => Date }
  atualizadoEm?: { toDate: () => Date }
}

function normalizePermissions(input?: string[] | UserPermissionGrant[]): UserPermissionGrant[] {
  if (!input?.length) return []
  return input.map((p) =>
    typeof p === 'string'
      ? { key: p, eventIds: [GLOBAL_PERMISSION_SCOPE] }
      : { key: p.key, eventIds: p.eventIds?.length ? p.eventIds : [GLOBAL_PERMISSION_SCOPE] },
  )
}

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null
  if (!authorizationHeader.startsWith('Bearer ')) return null

  return authorizationHeader.split('Bearer ')[1]
}

function isProfileComplete(document: UserDocument): boolean {
  return !!document.cpf
}

function isProfileCompleteForEvent(document: UserDocument): boolean {
  return !!document.cpf && !!document.telefone && !!document.dataNascimento && !!document.sexo
}

export function mapUserDocumentToResponse(documentId: string, document: UserDocument) {
  return {
    id: documentId,
    email: document.email,
    nome: document.nome,
    telefone: document.telefone,
    cpf: document.cpf,
    cpfFormatado: document.cpf ? formatCPF(document.cpf) : undefined,
    dataNascimento: document.dataNascimento?.toDate?.()?.toISOString(),
    sexo: document.sexo,
    role: document.role,
    permissions: normalizePermissions(document.permissions),
    isProfileComplete: isProfileComplete(document),
    isProfileCompleteForEvent: isProfileCompleteForEvent(document),
    criadoEm: document.criadoEm?.toDate?.()?.toISOString(),
    atualizadoEm: document.atualizadoEm?.toDate?.()?.toISOString(),
  }
}
