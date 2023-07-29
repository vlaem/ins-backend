import { DateTime } from 'luxon'
import uidSafe from 'uid-safe'

interface LinkInviteData {
  id: string
  expiresAt: DateTime
}

export class LinkInvite {
  static create() {
    const invite = new LinkInvite()

    invite._id = uidSafe.sync(32)
    invite._expiresAt = DateTime.now().plus({ days: 1 })
    return invite
  }

  static load(data: LinkInviteData) {
    const invite = new LinkInvite()

    invite._id = data.id
    invite._expiresAt = data.expiresAt

    return invite
  }

  private constructor() {}

  private _id: string = ''
  get id(): string {
    return this._id
  }

  private _expiresAt: DateTime = DateTime.now()
  get expiresAt(): DateTime {
    return this._expiresAt
  }
}
