import { formatCPF } from '@/lib/formatters'

export interface UserDocument {
  email: string
  nome: string
  telefone?: string
  cpf?: string
  role: string
  criadoEm?: { toDate: () => Date }
  atualizadoEm?: { toDate: () => Date }
}

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null
  if (!authorizationHeader.startsWith('Bearer ')) return null

  return authorizationHeader.split('Bearer ')[1]
}

export function mapUserDocumentToResponse(documentId: string, document: UserDocument) {
  return {
    id: documentId,
    email: document.email,
    nome: document.nome,
    telefone: document.telefone,
    cpf: document.cpf,
    cpfFormatado: document.cpf ? formatCPF(document.cpf) : undefined,
    role: document.role,
    isProfileComplete: !!(document.nome && document.cpf && document.telefone),
    criadoEm: document.criadoEm?.toDate?.()?.toISOString(),
    atualizadoEm: document.atualizadoEm?.toDate?.()?.toISOString(),
  }
}
