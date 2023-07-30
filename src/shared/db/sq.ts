import { Sequelize } from '@sequelize/core'
import { Config } from 'src/shared/config'
import { UserModel, InviteModel, UserRefreshTokenModel } from './models/auth'

export const sequelize = new Sequelize(Config.Database.Url, {
  models: [UserModel, InviteModel, UserRefreshTokenModel],
  logging: false,
})

export const models = {
  UserModel,
  InviteModel,
  UserRefreshTokenModel,
}
