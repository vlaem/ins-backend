import { DateTime } from 'luxon'
import { User } from './user'
import uidSafe from 'uid-safe'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'

export type UserRefreshToken = {
  id: string
  userId: string
  issuedAt: DateTime
  expiresAt: DateTime
}

const generateId = () => () => uidSafe(32)

export const createRefreshTokenForUser = (
  user: User
): T.Task<UserRefreshToken> =>
  pipe(
    T.Do,
    T.bind('id', generateId),
    T.map(({ id }) => ({
      id,
      userId: user.id,
      issuedAt: DateTime.now(),
      expiresAt: DateTime.now().plus({ days: 30 }),
    }))
  )

/**
 * Creates a new refresh token from an existing one with the same user id.
 * No changes are made to the existing token, the caller is responsible for
 * deleting it.
 */
export const extendRefreshToken = (
  token: UserRefreshToken
): T.Task<UserRefreshToken> =>
  pipe(
    T.Do,
    T.bind('id', generateId),
    T.map(({ id }) => ({
      id,
      userId: token.userId,
      issuedAt: DateTime.now(),
      expiresAt: DateTime.now().plus({ days: 30 }),
    }))
  )
