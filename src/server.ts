import '~config/load'
import { getPort } from '~config/server-config'
import { logger } from '~logger'
import { App } from '~/api/app'
import { serve as honoNodeServe } from '@hono/node-server'

honoNodeServe(
  {
    fetch: App.fetch,
    port: getPort(),
  },
  (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  }
)
