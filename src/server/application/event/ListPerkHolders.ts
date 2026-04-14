import { getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'

export interface PerkAllocationDTO {
  inscriptionId: string
  userId: string | null
  nome: string
  cpf: string
  email: string
  telefone: string
  alocadoEm: string
}

export interface ListPerkHoldersOutput {
  perkId: string
  total: number
  holders: PerkAllocationDTO[]
}

export class ListPerkHolders {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
  ) {}

  async execute(eventId: string, perkId: string): Promise<ListPerkHoldersOutput> {
    const db = getAdminFirestore()
    const snap = await db
      .collection('events').doc(eventId)
      .collection('perks').doc(perkId)
      .collection('allocations')
      .orderBy('alocadoEm', 'asc')
      .get()

    const holders = await Promise.all(
      snap.docs.map((doc) => this.resolveHolder(doc, eventId)),
    )

    return { perkId, total: holders.length, holders }
  }

  private async resolveHolder(
    doc: FirebaseFirestore.DocumentSnapshot,
    eventId: string,
  ): Promise<PerkAllocationDTO> {
    const d = doc.data()!
    const inscriptionId = d.inscriptionId ?? doc.id
    const userId = d.userId ?? null
    const alocadoEm = d.alocadoEm?.toDate?.()?.toISOString?.() ?? ''

    const fromGuest = await this.resolveFromInscription(inscriptionId, eventId)
    if (fromGuest) return { inscriptionId, userId, alocadoEm, ...fromGuest }

    const fromUser = await this.resolveFromUser(userId)
    if (fromUser) return { inscriptionId, userId, alocadoEm, ...fromUser }

    return { inscriptionId, userId, nome: '', cpf: '', email: '', telefone: '', alocadoEm }
  }

  private async resolveFromInscription(inscriptionId: string, eventId: string) {
    const inscription = await this.inscriptionRepository.findById(inscriptionId, eventId)
    if (!inscription?.guestData) return null

    return {
      nome: inscription.guestData.nome,
      cpf: inscription.guestData.cpf.getValue(),
      email: inscription.guestData.email.getValue(),
      telefone: inscription.guestData.telefone.getValue(),
    }
  }

  private async resolveFromUser(userId: string | null) {
    if (!userId) return null

    const user = await this.userRepository.findById(userId)
    if (!user) return null

    const data = user.toJSON()
    return {
      nome: data.nome,
      cpf: data.cpf ?? '',
      email: data.email,
      telefone: data.telefone ?? '',
    }
  }
}
