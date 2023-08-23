import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { honoSwaggerUI } from 'hono-swagger-jsdoc'
import { metrics } from './middlewares/metrics'
import { V1Route } from './routes/v1-route'

export function createApp() {
  const app = new Hono()

  app
    .use('/*', cors())
    .use('/*', metrics())
    .get(
      '/api-docs',
      honoSwaggerUI({
        urls: [{ url: '/v1/swagger.json', name: 'v1' }],
      })
    )
    .get('/', (c) => c.redirect('/api-docs'))
    .route('/v1', V1Route)
    
  return app
}
