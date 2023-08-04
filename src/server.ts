import { Config } from './shared/config'
import { serve as honoNodeServe } from '@hono/node-server'
import app from 'src/api/app'
import logger from '#logger'

export function serve(): void {
  honoNodeServe(
    {
      fetch: app.fetch,
      port: Config.Web.Port,
    },
    (info) => {
      logger.info(`Listening on http://localhost:${info.port}`)
    }
  )
}
