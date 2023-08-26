import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { findUserById } from '~/modules/auth/infra/repositories/user-repository'
import { ResourceNotFoundError } from '~errors'

interface CurrentUserView {
  id: string
  email: string
}

export const getCurrentUser = (userId: string) =>
  pipe(
    userId,
    findUserById,
    TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND')),
    TE.map(
      (user) =>
        ({
          id: user.id,
          email: user.email,
        }) as CurrentUserView
    )
  )
