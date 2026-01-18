import { formatCPF } from '@/lib/formatters'
import { Gender } from '@/shared/constants'

export interface UserDocument {
  email: string
  nome: string
  telefone?: string
  cpf?: string
  dataNascimento?: { toDate: () => Date }
  sexo?: Gender
  role: string
  criadoEm?: { toDate: () => Date }
  atualizadoEm?: { toDate: () => Date }
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
    isProfileComplete: isProfileComplete(document),
    isProfileCompleteForEvent: isProfileCompleteForEvent(document),
    criadoEm: document.criadoEm?.toDate?.()?.toISOString(),
    atualizadoEm: document.atualizadoEm?.toDate?.()?.toISOString(),
  }
}
