import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { V1Route } from './routes/v1'
import { honoSwaggerUI } from 'hono-swagger-jsdoc'
import { MetricsMiddleware } from './middlewares'
import { ExtendedHTTPException } from '~errors'
import { Logger } from '~logger'

export function createApp(
  V1Route: V1Route,
  metrics: MetricsMiddleware,
  logger: Logger
) {
  const app = new Hono()

  app.use('/*', cors())
  app.use('/*', metrics())

  app.get(
    '/api-docs',
    honoSwaggerUI({
      urls: [{ url: '/v1/swagger.json', name: 'v1' }],
    })
  )

  app.get('/', (c) => c.redirect('/api-docs'))

  app.route('/v1', V1Route)

  app.onError((err, c) => {
    if (err instanceof ExtendedHTTPException) {
      if (err.status === 500) logger.error(err)
      return c.json(
        {
          errorCode: err.code,
        },
        err.status
      )
    } else {
      logger.error(err)
      return c.json(
        {
          message: 'An unexpected error occurred',
        },
        500
      )
    }
  })

  return app
}
