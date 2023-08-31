import { MiddlewareHandler } from 'hono'
import { logger } from '~logger'

export function metrics(): MiddlewareHandler {
  return async (c, next) => {
    const startTime = Date.now()
    await next()
    const responseTime = (Date.now() - startTime) / 1000
    logger.info(`${c.req.method} ${c.req.path} ${c.res.status} `, {
      responseTime,
    })
  }
}
