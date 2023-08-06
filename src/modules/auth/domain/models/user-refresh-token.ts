import { DateTime } from 'luxon'
import uidSafe from 'uid-safe'

interface UserRefreshTokenData {
  id: string
  userId: string
  expiresAt: DateTime
  createdAt: DateTime
}

export class UserRefreshToken {
  static create(userId: string, expiresAt: DateTime): UserRefreshToken {
    const token = new UserRefreshToken()

    token._id = uidSafe.sync(32)
    token._userId = userId
    token._expiresAt = expiresAt
    token._createdAt = DateTime.now()

    return token
  }

  static load(data: UserRefreshTokenData): UserRefreshToken {
    const token = new UserRefreshToken()

    token._id = data.id
    token._userId = data.userId
    token._expiresAt = data.expiresAt
    token._createdAt = data.createdAt

    return token
  }

  private constructor() {}

  private _id: string = ''
  get id(): string {
    return this._id
  }

  private _userId: string = ''
  get userId(): string {
    return this._userId
  }

  private _expiresAt: DateTime = DateTime.now()
  get expiresAt(): DateTime {
    return this._expiresAt
  }

  private _createdAt: DateTime = DateTime.now()
  get createdAt(): DateTime {
    return this._createdAt
  }
}
