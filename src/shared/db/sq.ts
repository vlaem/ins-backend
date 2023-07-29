import { Sequelize } from '@sequelize/core'
import { Config } from 'src/shared/config'
import {
  UserModel,
  LinkInviteModel,
  UserRefreshTokenModel,
} from './models/auth'

export const sequelize = new Sequelize(Config.Database.Url, {
  models: [UserModel, LinkInviteModel, UserRefreshTokenModel],
  logging: true,
})

export const models = {
  UserModel,
  LinkInviteModel,
  UserRefreshTokenModel,
}
