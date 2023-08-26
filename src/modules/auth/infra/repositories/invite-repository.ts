import { DateTime } from 'luxon'
import { Op } from '@sequelize/core'
import { Invite } from '~/modules/auth/domain/models/invite'
import { Invite as InviteModel } from '~dbmodels/auth'
import * as T from 'fp-ts/Task'
import * as TO from 'fp-ts/TaskOption'
import { pipe } from 'fp-ts/function'

const inviteToPersistence = (invite: Invite) => ({
  id: invite.id,
  expiresAt: invite.expiresAt,
  createdAt: invite.createdAt,
})

type InvitePersistence = ReturnType<typeof inviteToPersistence>

export const saveInvite = (invite: Invite) => {
  const save = (x: InvitePersistence) => () => InviteModel.upsert(x)

  return pipe(
    invite,
    inviteToPersistence,
    save,
    T.map(() => invite)
  )
}

export const findOneNonExpiredById = (id: string): TO.TaskOption<Invite> => {
  const find = (id: string) => () =>
    InviteModel.findOne({
      where: {
        id,
        expiresAt: {
          [Op.gt]: DateTime.now(),
        },
      },
    })

  return pipe(
    id,
    find,
    TO.fromTask,
    TO.flatMap(TO.fromNullable),
    TO.map(Invite.load)
  )
}

export const addInvite = (invite: Invite) => {
  const save = (x: Invite) => () => InviteModel.upsert(inviteToPersistence(x))

  return pipe(
    invite,
    save,
    T.map(() => invite)
  )
}

export const deleteInvite = (invite: Invite) => {
  const destroy = (x: Invite) => () =>
    InviteModel.destroy({ where: { id: x.id } })

  return pipe(
    invite,
    destroy,
    T.map(() => {})
  )
}
