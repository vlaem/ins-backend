import { Config } from '#config'
import { Logger } from '#logger'
import { bottle } from '#container'
import { createApp } from 'src/api/app'
import { serve as honoNodeServe } from '@hono/node-server'

const config = bottle.container.config as Config
config.load()

const logger = bottle.container.logger as Logger

const app = bottle.container.app as ReturnType<typeof createApp>

honoNodeServe(
  {
    fetch: app.fetch,
    port: config.Server.port,
  },
  (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  }
)
