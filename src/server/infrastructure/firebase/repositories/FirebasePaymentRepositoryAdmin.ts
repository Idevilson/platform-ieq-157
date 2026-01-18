import { getAdminFirestore } from '../admin'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { IPaymentRepository, ListPaymentsParams } from '@/server/domain/payment/repositories/IPaymentRepository'
import { PaymentStatus, PaymentMethod } from '@/server/domain/shared/types'
import { Timestamp } from 'firebase-admin/firestore'

interface PaymentDocument {
  id: string
  userId?: string
  asaasPaymentId: string
  valor: number
  status: PaymentStatus
  metodoPagamento: PaymentMethod
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  dataVencimento: Timestamp
  dataPagamento?: Timestamp
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export class FirebasePaymentRepositoryAdmin implements IPaymentRepository {
  private get db() {
    return getAdminFirestore()
  }

  private paymentsRef(eventId: string, inscriptionId: string) {
    return this.db
      .collection('events').doc(eventId)
      .collection('inscriptions').doc(inscriptionId)
      .collection('payments')
  }

  private get paymentsGroupRef() {
    return this.db.collectionGroup('payments')
  }

  async findById(id: string, eventId?: string, inscriptionId?: string): Promise<Payment | null> {
    if (eventId && inscriptionId) {
      const docSnap = await this.paymentsRef(eventId, inscriptionId).doc(id).get()
      if (!docSnap.exists) return null
      return this.mapToEntity(docSnap, inscriptionId)
    }

    const querySnapshot = await this.paymentsGroupRef
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) return null
    const doc = querySnapshot.docs[0]
    const inscriptionIdFromPath = doc.ref.parent.parent?.id || ''
    return this.mapToEntity(doc, inscriptionIdFromPath)
  }

  async findByAsaasPaymentId(asaasPaymentId: string): Promise<Payment | null> {
    const querySnapshot = await this.paymentsGroupRef
      .where('asaasPaymentId', '==', asaasPaymentId)
      .limit(1)
      .get()

    if (querySnapshot.empty) return null
    const doc = querySnapshot.docs[0]
    const inscriptionId = doc.ref.parent.parent?.id || ''
    return this.mapToEntity(doc, inscriptionId)
  }

  async findByInscriptionId(inscriptionId: string, eventId?: string): Promise<Payment | null> {
    if (eventId) {
      const querySnapshot = await this.paymentsRef(eventId, inscriptionId)
        .orderBy('criadoEm', 'desc')
        .limit(1)
        .get()

      if (querySnapshot.empty) return null
      return this.mapToEntity(querySnapshot.docs[0], inscriptionId)
    }

    const querySnapshot = await this.paymentsGroupRef
      .orderBy('criadoEm', 'desc')
      .get()

    for (const doc of querySnapshot.docs) {
      const parentInscriptionId = doc.ref.parent.parent?.id
      if (parentInscriptionId === inscriptionId) {
        return this.mapToEntity(doc, inscriptionId)
      }
    }
    return null
  }

  async findByUserId(userId: string, params?: ListPaymentsParams): Promise<Payment[]> {
    let query = this.paymentsGroupRef
      .where('userId', '==', userId)
      .orderBy('criadoEm', 'desc')

    if (params?.status) {
      query = this.paymentsGroupRef
        .where('userId', '==', userId)
        .where('status', '==', params.status)
        .orderBy('criadoEm', 'desc')
    }

    const querySnapshot = await query.get()
    return querySnapshot.docs.map(doc => {
      const inscriptionId = doc.ref.parent.parent?.id || ''
      return this.mapToEntity(doc, inscriptionId)
    })
  }

  async save(payment: Payment, eventId: string): Promise<void> {
    const data = this.mapToDocument(payment)
    await this.paymentsRef(eventId, payment.inscriptionId).doc(payment.id).set(data)
  }

  async update(payment: Payment, eventId: string): Promise<void> {
    const data = this.mapToDocument(payment)
    await this.paymentsRef(eventId, payment.inscriptionId).doc(payment.id).update(data)
  }

  async delete(id: string, eventId: string, inscriptionId: string): Promise<void> {
    await this.paymentsRef(eventId, inscriptionId).doc(id).delete()
  }

  async sumConfirmedByEventId(eventId: string): Promise<number> {
    const inscriptionsRef = this.db.collection('events').doc(eventId).collection('inscriptions')
    const inscriptionsSnapshot = await inscriptionsRef.get()

    let total = 0
    for (const inscriptionDoc of inscriptionsSnapshot.docs) {
      const paymentsSnapshot = await inscriptionDoc.ref.collection('payments')
        .where('status', 'in', ['CONFIRMED', 'RECEIVED'])
        .get()

      for (const paymentDoc of paymentsSnapshot.docs) {
        total += paymentDoc.data().valor || 0
      }
    }
    return total
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot, inscriptionId: string): Payment {
    const data = docSnap.data() as PaymentDocument
    return Payment.fromPersistence({
      id: docSnap.id,
      inscriptionId: inscriptionId,
      userId: data.userId,
      asaasPaymentId: data.asaasPaymentId,
      valor: data.valor,
      status: data.status,
      metodoPagamento: data.metodoPagamento,
      pixQrCode: data.pixQrCode,
      pixCopiaECola: data.pixCopiaECola,
      boletoUrl: data.boletoUrl,
      dataVencimento: data.dataVencimento.toDate(),
      dataPagamento: data.dataPagamento?.toDate(),
      criadoEm: data.criadoEm.toDate(),
      atualizadoEm: data.atualizadoEm.toDate(),
    })
  }

  private mapToDocument(payment: Payment): Record<string, unknown> {
    const json = payment.toJSON()
    return {
      id: json.id,
      userId: json.userId,
      asaasPaymentId: json.asaasPaymentId,
      valor: json.valor,
      status: json.status,
      metodoPagamento: json.metodoPagamento,
      pixQrCode: json.pixQrCode,
      pixCopiaECola: json.pixCopiaECola,
      boletoUrl: json.boletoUrl,
      dataVencimento: Timestamp.fromDate(json.dataVencimento as Date),
      dataPagamento: json.dataPagamento ? Timestamp.fromDate(json.dataPagamento as Date) : null,
      criadoEm: Timestamp.fromDate(json.criadoEm as Date),
      atualizadoEm: Timestamp.fromDate(json.atualizadoEm as Date),
    }
  }
}
