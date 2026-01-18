import { UserContact } from './UserContact'
import { UserEventProfile } from './UserEventProfile'
import { UpdateUserDataParams } from './UserStateParams'
import { Gender } from '@/shared/constants'

export class UserData {
  private constructor(
    private readonly contact: UserContact,
    private readonly eventProfile: UserEventProfile
  ) {}

  static create(nome: string, telefone?: string): UserData {
    return new UserData(UserContact.create(nome, telefone), UserEventProfile.empty())
  }

  static restore(nome: string, telefone?: string, dataNascimento?: Date, sexo?: Gender): UserData {
    return new UserData(
      UserContact.fromPersistence(nome, telefone),
      UserEventProfile.create(dataNascimento, sexo)
    )
  }

  isEventReady(): boolean {
    return this.contact.hasPhone() && this.eventProfile.isComplete()
  }

  applyUpdates(params: UpdateUserDataParams): UserData {
    const newContact = this.contact.applyUpdates(params.nome, params.telefone)
    const newProfile = this.eventProfile.applyUpdates(params.dataNascimento, params.sexo)
    return new UserData(newContact, newProfile)
  }

  toJSON() {
    return { ...this.contact.toJSON(), ...this.eventProfile.toJSON() }
  }
}
