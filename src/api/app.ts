import { Hono } from 'hono'
import { cors } from 'hono/cors'
import setupRoutes from './routes'
import { honoSwaggerUI } from './hono-swagger'
import { metrics } from './middlewares/metrics'

const app = new Hono()

app.use('/*', cors())
app.use('/*', metrics())

app.get(
  '/api-docs',
  honoSwaggerUI({
    route: '/api-docs',
    urls: [{ url: '/v1/swagger.json', name: 'v1' }],
  })
)

app.get('/', (c) => c.redirect('/api-docs'))

setupRoutes(app)

export default app
