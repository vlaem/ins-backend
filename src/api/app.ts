import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createV1Route } from './routes/v1'
import { honoSwaggerUI } from 'hono-swagger-jsdoc'
import { metrics } from './middlewares/metrics'

export function createApp(V1Route: ReturnType<typeof createV1Route>) {
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

  return app
}
