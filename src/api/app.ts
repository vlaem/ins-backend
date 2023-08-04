import { Hono } from 'hono'
import { cors } from 'hono/cors'
import setupRoutes from './routes'
import setupSwagger from './swagger'
import { metrics } from './middlewares/metrics'
const app = new Hono()

app.use('/*', cors())
app.use('/*', metrics())

setupRoutes(app)
setupSwagger(app, {
  urls: [{ url: 'http://localhost:3001/v1/swagger.json', name: 'v1' }],
})

export default app
