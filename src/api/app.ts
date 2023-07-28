import { Hono } from 'hono'
import setupRoutes from './routes'
import setupSwagger from './swagger'

const app = new Hono()

setupRoutes(app)
setupSwagger(app, {
  urls: [{ url: 'http://localhost:3001/v1/swagger.json', name: 'v1' }],
})

export default app
