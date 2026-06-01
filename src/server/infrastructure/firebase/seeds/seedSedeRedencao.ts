import { getAdminFirestore } from '../admin'
import { SEDE_REDENCAO_SLUG } from '@/shared/types/church'
import { Timestamp } from 'firebase-admin/firestore'

const CHURCHES_COLLECTION = 'churches'

export async function seedSedeRedencao(): Promise<{ created: boolean }> {
  const db = getAdminFirestore()
  const ref = db.collection(CHURCHES_COLLECTION).doc(SEDE_REDENCAO_SLUG)
  const snap = await ref.get()

  if (snap.exists) {
    return { created: false }
  }

  const now = Timestamp.now()
  await ref.set({
    nome: 'SEDE DE REDENÇÃO',
    slug: SEDE_REDENCAO_SLUG,
    cidade: 'Redenção',
    estado: 'PA',
    ativo: true,
    totalMembros: 0,
    criadoEm: now,
    atualizadoEm: now,
  })

  return { created: true }
}
