import { findOneNonExpiredById } from '~/modules/auth/infra/repositories/invite-repository'
import { ResourceNotFoundError } from '~errors'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

interface InviteView {
  id: string
}

export const getInvite = (inviteCode: string) =>
  pipe(
    inviteCode,
    findOneNonExpiredById,
    TE.fromTaskOption(() =>
      ResourceNotFoundError.of('INVITE_NOT_FOUND_OR_EXPIRED')
    ),
    TE.map(
      (invite) =>
        ({
          id: invite.id,
        }) as InviteView
    )
  )
