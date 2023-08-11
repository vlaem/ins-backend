import { Sequelize } from '@sequelize/core'
import { Config } from '~config'
import { init } from './models/auth'

export function createSequelize(config: Config) {
  const sequelize = new Sequelize(config.Database.url, {
    logging: false,
  })

  init(sequelize)

  return sequelize
}
