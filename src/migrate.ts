import '~config/load'
import { logger } from '~logger'
import { umzug } from './infrastructure/db/umzug'

umzug.up().then(() => {
  logger.info('Migration complete')
  process.exit(0)
})
