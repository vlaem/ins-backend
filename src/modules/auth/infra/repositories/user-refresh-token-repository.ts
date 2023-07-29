import { DateTime } from 'luxon'
import { Op, FindOptions, InferAttributes } from '@sequelize/core'
import { UserRefreshToken } from 'src/modules/auth/domain/models'
import { UserRefreshTokenModel } from '@dbmodels/auth'
import { GenericRepository } from './generic-repository'

class UserRefreshTokenRepository
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

export const userRefreshTokenRepository = new UserRefreshTokenRepository()
