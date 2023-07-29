import { DateTime } from 'luxon'
import { Op, FindOptions, InferAttributes } from '@sequelize/core'
import { LinkInvite } from 'src/modules/auth/domain/models'
import { LinkInviteModel } from 'src/shared/db/models/auth'
import { GenericRepository } from './generic-repository'

class LinkInviteRepository
  implements GenericRepository<LinkInvite, LinkInviteModel>
{
  async findOne(
    options?:
      | FindOptions<InferAttributes<LinkInviteModel, { omit: never }>>
      | undefined
  ) {
    const sqRefreshToken = await LinkInviteModel.findOne(options)

    if (!sqRefreshToken) {
      return null
    }

    return LinkInvite.load(sqRefreshToken)
  }

  async findOneNonExpiredById(id: string): Promise<LinkInvite | null> {
    return this.findOne({
      where: {
        id,
        expiresAt: {
          [Op.gt]: DateTime.now(),
        },
      },
    })
  }

  async add(refreshToken: LinkInvite): Promise<void> {
    await LinkInviteModel.create({
      id: refreshToken.id,
      expiresAt: refreshToken.expiresAt,
    })
  }

  async update(refreshToken: LinkInvite): Promise<void> {
    await LinkInviteModel.update(
      {
        expiresAt: refreshToken.expiresAt,
      },
      { where: { id: refreshToken.id } }
    )
  }

  async updateAll(refreshTokens: LinkInvite[]): Promise<void> {
    for (const refreshToken of refreshTokens) {
      await this.update(refreshToken)
    }
  }

  async destroy(refreshToken: LinkInvite): Promise<void> {
    await LinkInviteModel.destroy({ where: { id: refreshToken.id } })
  }
}

export const linkInviteRepository = new LinkInviteRepository()
