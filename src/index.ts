import { serve } from '@hono/node-server'
import app from 'src/api/app'
import logger from '@logger'

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  }
)
