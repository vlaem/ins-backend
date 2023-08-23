import { DateTime } from 'luxon'
import uidSafe from 'uid-safe'
import { Task } from 'fp-ts/Task'

interface UserRefreshTokenData {
  id: string
  userId: string
  expiresAt: DateTime
  createdAt: DateTime
}

export class UserRefreshToken {
  static create(userId: string): Task<UserRefreshToken> {
    return async () => {
      const token = new UserRefreshToken()

      token._id = await uidSafe(32)
      token._userId = userId
      token._expiresAt = DateTime.now().plus({ days: 30 })
      token._createdAt = DateTime.now()

      return token
    }
  }

  static extendFrom(token: UserRefreshToken): Task<UserRefreshToken> {
    return async () => {
      const newToken = new UserRefreshToken()

      newToken._id = await uidSafe(32)
      newToken._userId = token.userId
      newToken._expiresAt = DateTime.now().plus({ days: 30 })
      newToken._createdAt = DateTime.now()

      return newToken
    }
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
