import { DateTime } from 'luxon'
import { Op } from '@sequelize/core'
import { UserRefreshToken } from '~domain/models/user-refresh-token'
import { UserRefreshToken as UserRefreshTokenModel } from '~dbmodels/auth'
import * as T from 'fp-ts/Task'
import * as TO from 'fp-ts/TaskOption'
import { pipe } from 'fp-ts/function'

export const save = (refreshToken: UserRefreshToken) => {
  const save = (x: UserRefreshToken) => () => UserRefreshTokenModel.upsert(x)

  return pipe(
    refreshToken,
    save,
    T.map(() => refreshToken)
  )
}

export const findNonExpiredById = (id: string) => {
  const find = (id: string) => () =>
    UserRefreshTokenModel.findOne({
      where: {
        id: id,
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
    TO.map((x) => x as UserRefreshToken)
  )
}

export const destroy = (refreshToken: UserRefreshToken) => {
  const destroy = (x: UserRefreshToken) => () =>
    UserRefreshTokenModel.destroy({ where: { id: x.id } })

  return pipe(
    refreshToken,
    destroy,
    T.map(() => {})
  )
}
