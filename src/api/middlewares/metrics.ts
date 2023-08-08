import { MiddlewareHandler } from 'hono'
import { Logger } from '~logger'

export function createMetricsMiddleware(logger: Logger): MetricsMiddleware {
  return () => {
    return async (c, next) => {
      const startTime = Date.now()
      await next()
      const responseTime = (Date.now() - startTime) / 1000
      logger.info(`${c.req.method} ${c.req.path} ${c.res.status} `, {
        responseTime,
      })
    }
  }
}

export type MetricsMiddleware = () => MiddlewareHandler
