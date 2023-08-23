import { DateTime } from 'luxon'
import { Op, FindOptions, InferAttributes } from '@sequelize/core'
import { UserRefreshToken } from '~/modules/auth/domain/models'
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

export const findRefreshTokenById = (id: string) => {
  const find = (id: string) => () =>
    UserRefreshTokenModel.findOne({ where: { id: id } })

  return pipe(
    id,
    find,
    TO.fromTask,
    TO.flatMap(TO.fromNullable),
    TO.map(UserRefreshToken.load)
  )
}

/*
export class UserRefreshTokenRepository
  implements GenericRepository<UserRefreshToken, UserRefreshTokenModel>
{
  async findOne(
    options?:
      | FindOptions<InferAttributes<UserRefreshTokenModel, { omit: never }>>
      | undefined
  ) {
    const sqRefreshToken = await UserRefreshTokenModel.findOne(options)

    if (!sqRefreshToken) {
      return null
    }

    return UserRefreshToken.load(sqRefreshToken)
  }

  async add(refreshToken: UserRefreshToken): Promise<void> {
    await UserRefreshTokenModel.create({
      id: refreshToken.id,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    })
  }

  async update(refreshToken: UserRefreshToken): Promise<void> {
    await UserRefreshTokenModel.update(
      {
        userId: refreshToken.userId,
        expiresAt: refreshToken.expiresAt,
      },
      { where: { id: refreshToken.id } }
    )
  }

  async updateAll(refreshTokens: UserRefreshToken[]): Promise<void> {
    for (const refreshToken of refreshTokens) {
      await this.update(refreshToken)
    }
  }

  async destroy(refreshToken: UserRefreshToken): Promise<void> {
    await UserRefreshTokenModel.destroy({ where: { id: refreshToken.id } })
  }

  async findOneNonExpiredById(id: string): Promise<UserRefreshToken | null> {
    return this.findOne({
      where: {
        id,
        expiresAt: {
          [Op.gt]: DateTime.now(),
        },
      },
    })
  }
}
*/
