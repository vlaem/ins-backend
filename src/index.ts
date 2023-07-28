import { loadConfig, Config } from './shared/config'
loadConfig()

import { serve } from '@hono/node-server'
import app from 'src/api/app'
import logger from '@logger'

serve(
  {
    fetch: app.fetch,
    port: Config.Web.Port,
  },
  (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  }
)
