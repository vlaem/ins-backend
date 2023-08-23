import '~config/load'
import './shared/db/sq'
import { getPort } from '~config/server-config'
import { logger } from '~logger'
import { createApp } from '~/api/app'
import { serve as honoNodeServe } from '@hono/node-server'

honoNodeServe(
  {
    fetch: createApp().fetch,
    port: getPort(),
  },
  (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  }
)
