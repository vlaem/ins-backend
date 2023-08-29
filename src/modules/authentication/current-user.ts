import { ResourceNotFoundError } from '~errors'
import * as TE from 'fp-ts/TaskEither'
import * as UserRepo from '~/infrastructure/repositories/user-repository'
import { pipe } from 'fp-ts/function'

export interface CurrentUserView {
  id: string
  email: string
}

export const getCurrentUser = (currentUserId: string) =>
  pipe(
    currentUserId,
    UserRepo.findById,
    TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND')),
    TE.map(
      (x) =>
        ({
          id: x.id,
          email: x.email,
        }) as CurrentUserView
    )
  )
