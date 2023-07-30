import { DateTime } from 'luxon'
import { Op, FindOptions, InferAttributes } from '@sequelize/core'
import { Invite } from 'src/modules/auth/domain/models'
import { InviteModel } from '@dbmodels/auth'
import { GenericRepository } from './generic-repository'

class InviteRepository implements GenericRepository<Invite, InviteModel> {
  async findOne(
    options?:
      | FindOptions<InferAttributes<InviteModel, { omit: never }>>
      | undefined
  ) {
    const sqRefreshToken = await InviteModel.findOne(options)

    if (!sqRefreshToken) {
      return null
    }

    return Invite.load(sqRefreshToken)
  }

  async findOneNonExpiredById(id: string): Promise<Invite | null> {
    return this.findOne({
      where: {
        id,
        expiresAt: {
          [Op.gt]: DateTime.now(),
        },
      },
    })
  }

  async add(refreshToken: Invite): Promise<void> {
    await InviteModel.create({
      id: refreshToken.id,
      expiresAt: refreshToken.expiresAt,
    })
  }

  async update(refreshToken: Invite): Promise<void> {
    await InviteModel.update(
      {
        expiresAt: refreshToken.expiresAt,
      },
      { where: { id: refreshToken.id } }
    )
  }

  async updateAll(refreshTokens: Invite[]): Promise<void> {
    for (const refreshToken of refreshTokens) {
      await this.update(refreshToken)
    }
  }

  async destroy(refreshToken: Invite): Promise<void> {
    await InviteModel.destroy({ where: { id: refreshToken.id } })
  }
}

export const inviteRepository = new InviteRepository()
