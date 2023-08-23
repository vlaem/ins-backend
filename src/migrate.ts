import { Config } from './shared/config/config'
import { Umzug } from 'umzug'
import { createSequelize, createUmzug } from './shared/db'
import { loggerFactory, Logger } from '~logger'
import Bottle from 'bottlejs'

const bottle = new Bottle()
bottle.service('config', Config)
bottle.service('sequelize', createSequelize, 'config')
bottle.service('logger', loggerFactory, 'config')
bottle.service('umzug', createUmzug, 'logger', 'sequelize')

const logger = bottle.container.logger as Logger
const umzug = bottle.container.umzug as Umzug

umzug.up().then(() => {
  logger.info('Migration complete')
  process.exit(0)
})
