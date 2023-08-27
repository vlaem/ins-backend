import { Sequelize } from '@sequelize/core'
import { getUrl } from '~config/database-config'
import { init } from './models/auth'

export const sequelize = new Sequelize(getUrl(), {
  logging: false,
})

init(sequelize)
