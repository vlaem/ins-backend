import { Sequelize } from '@sequelize/core'
import { Config } from '~config'
import { UserModel, InviteModel, UserRefreshTokenModel } from './models/auth'

export function createSequelize(config: Config) {
  return new Sequelize(config.Database.url, {
    models: [UserModel, InviteModel, UserRefreshTokenModel],
    logging: false,
  })
}
