import { DateTime } from 'luxon'
import { Op } from '@sequelize/core'
import { Invite as InviteModel } from '~dbmodels/auth'
import * as T from 'fp-ts/Task'
import * as TO from 'fp-ts/TaskOption'
import { pipe } from 'fp-ts/function'
import { Invite } from '~domain/models/invite'

const modelToDomain = (x: InviteModel): Invite => ({
  id: x.id,
  expiresAt: x.expiresAt,
  createdAt: x.createdAt,
})

export const findNonExpiredById = (id: string) => {
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
    TO.map(modelToDomain)
  )
}

export const destroy = (invite: Invite) => {
  const destroy = (x: Invite) => () =>
    InviteModel.destroy({ where: { id: x.id } })

  return pipe(
    invite,
    destroy,
    T.map(() => {})
  )
}
