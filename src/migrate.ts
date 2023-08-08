import { Config } from '~config'
import { Logger } from '~logger'
import { bottle } from './container'
import { Umzug } from 'umzug'

const config = bottle.container.config as Config
config.load()

const logger = bottle.container.logger as Logger

const umzug = bottle.container.umzug as Umzug

umzug.up().then(() => {
  logger.info('Migration complete')
  process.exit(0)
})
