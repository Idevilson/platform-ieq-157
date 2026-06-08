import { getAdminFirestore } from '../admin'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'
import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { Gender, InscriptionPaymentMethod } from '@/shared/constants'
import { Timestamp } from 'firebase-admin/firestore'

export class FirebaseBatchInscriptionRepositoryAdmin implements IBatchInscriptionRepository {
  private get db() {
    return getAdminFirestore()
  }

  private get batchRef() {
    return this.db.collection('batchInscriptions')
  }

  paymentsRef(batchId: string) {
    return this.batchRef.doc(batchId).collection('payments')
  }

  async findById(id: string): Promise<BatchInscription | null> {
    const docSnap = await this.batchRef.doc(id).get()
    if (!docSnap.exists) return null
    return this.mapToEntity(docSnap)
  }

  async findByEventId(eventId: string): Promise<BatchInscription[]> {
    const querySnapshot = await this.batchRef
      .where('eventId', '==', eventId)
      .orderBy('criadoEm', 'desc')
      .get()
    return querySnapshot.docs.map(doc => this.mapToEntity(doc))
  }

  async findByResponsavelCPF(cpf: string): Promise<BatchInscription[]> {
    const querySnapshot = await this.batchRef
      .where('responsavel.cpf', '==', cpf)
      .orderBy('criadoEm', 'desc')
      .get()
    return querySnapshot.docs.map(doc => this.mapToEntity(doc))
  }

  async save(batch: BatchInscription): Promise<void> {
    await this.batchRef.doc(batch.id).set(this.mapToFirestore(batch))
  }

  async update(batch: BatchInscription): Promise<void> {
    await this.batchRef.doc(batch.id).update(this.mapToFirestore(batch))
  }

  async delete(id: string): Promise<void> {
    await this.batchRef.doc(id).delete()
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot): BatchInscription {
    const data = docSnap.data()!
    return BatchInscription.fromPersistence({
      id: docSnap.id,
      eventId: data.eventId,
      categoryId: data.categoryId,
      status: data.status,
      paymentId: data.paymentId ?? undefined,
      preferredPaymentMethod: (data.preferredPaymentMethod as InscriptionPaymentMethod) || 'PIX',
      valorTotal: data.valorTotal || 0,
      responsavel: {
        nome: data.responsavel.nome,
        cpf: data.responsavel.cpf,
        email: data.responsavel.email,
        telefone: data.responsavel.telefone,
        dataNascimento: data.responsavel.dataNascimento?.toDate?.() || new Date(),
        sexo: data.responsavel.sexo as Gender,
        cidade: data.responsavel.cidade,
        campoMissionario: data.responsavel.campoMissionario ?? undefined,
      },
      cidade: data.cidade,
      participantes: (data.participantes || []).map((p: { nome: string; sexo: Gender; tamanho?: string; temBrinde?: boolean; perkId?: string; brindeAlocadoEm?: FirebaseFirestore.Timestamp }) => ({
        nome: p.nome,
        sexo: p.sexo,
        tamanho: p.tamanho ?? undefined,
        temBrinde: p.temBrinde ?? false,
        perkId: p.perkId,
        brindeAlocadoEm: p.brindeAlocadoEm?.toDate(),
      })),
      inscriptionIds: data.inscriptionIds || [],
      pixCopiaECola: data.pixCopiaECola ?? undefined,
      pixQrCode: data.pixQrCode ?? undefined,
      checkoutUrl: data.checkoutUrl ?? undefined,
      dataVencimentoPagamento: data.dataVencimentoPagamento?.toDate?.() ?? undefined,
      paymentStatus: data.paymentStatus ?? undefined,
      breakdown: data.breakdown ?? undefined,
      criadoEm: data.criadoEm?.toDate() || new Date(),
      atualizadoEm: data.atualizadoEm?.toDate() || new Date(),
    })
  }

  private mapToFirestore(batch: BatchInscription) {
    const json = batch.toJSON()
    return {
      eventId: json.eventId,
      categoryId: json.categoryId,
      status: json.status,
      paymentId: json.paymentId || null,
      preferredPaymentMethod: json.preferredPaymentMethod,
      valorTotal: json.valorTotal,
      responsavel: {
        nome: json.responsavel.nome,
        cpf: json.responsavel.cpf,
        email: json.responsavel.email,
        telefone: json.responsavel.telefone,
        dataNascimento: Timestamp.fromDate(new Date(json.responsavel.dataNascimento)),
        sexo: json.responsavel.sexo,
        cidade: json.responsavel.cidade,
        campoMissionario: json.responsavel.campoMissionario ?? null,
      },
      cidade: json.cidade,
      participantes: json.participantes.map(p => ({
        nome: p.nome,
        sexo: p.sexo,
        tamanho: p.tamanho ?? null,
        temBrinde: p.temBrinde,
        perkId: p.perkId ?? null,
        brindeAlocadoEm: p.brindeAlocadoEm ? Timestamp.fromDate(new Date(p.brindeAlocadoEm)) : null,
      })),
      inscriptionIds: json.inscriptionIds,
      pixCopiaECola: json.pixCopiaECola ?? null,
      pixQrCode: json.pixQrCode ?? null,
      checkoutUrl: json.checkoutUrl ?? null,
      breakdown: json.breakdown ?? null,
      dataVencimentoPagamento: json.dataVencimentoPagamento
        ? Timestamp.fromDate(new Date(json.dataVencimentoPagamento))
        : null,
      paymentStatus: json.paymentStatus ?? null,
      criadoEm: Timestamp.fromDate(new Date(json.criadoEm)),
      atualizadoEm: Timestamp.fromDate(new Date(json.atualizadoEm)),
    }
  }
}
