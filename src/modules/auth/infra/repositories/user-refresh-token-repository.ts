import { DateTime } from 'luxon'
import { Op } from '@sequelize/core'
import { UserRefreshToken } from '~/modules/auth/domain/models/user-refresh-token'
import { UserRefreshToken as UserRefreshTokenModel } from '~dbmodels/auth'
import * as T from 'fp-ts/Task'
import * as TO from 'fp-ts/TaskOption'
import { pipe } from 'fp-ts/function'

const refreshTokenToPersistence = (refreshToken: UserRefreshToken) => ({
  id: refreshToken.id,
  userId: refreshToken.userId,
  expiresAt: refreshToken.expiresAt,
  createdAt: refreshToken.createdAt,
})

type RefreshTokenPersistence = ReturnType<typeof refreshTokenToPersistence>

export const saveRefreshToken = (refreshToken: UserRefreshToken) => {
  const save = (x: RefreshTokenPersistence) => () =>
    UserRefreshTokenModel.upsert(x)

  return pipe(
    refreshToken,
    refreshTokenToPersistence,
    save,
    T.map(() => refreshToken)
  )
}

export const findRefreshTokenNonExpiredById = (id: string) => {
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
    TO.map(UserRefreshToken.load)
  )
}

export const deleteRefreshToken = (refreshToken: UserRefreshToken) => {
  const destroy = (x: RefreshTokenPersistence) => () =>
    UserRefreshTokenModel.destroy({ where: { id: x.id } })

  return pipe(
    refreshToken,
    refreshTokenToPersistence,
    destroy,
    T.map(() => {})
  )
}
