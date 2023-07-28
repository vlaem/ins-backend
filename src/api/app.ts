import { Hono } from 'hono'
import setupRoutes from './routes'
import setupSwagger from './swagger'

const app = new Hono()

setupRoutes(app)
setupSwagger(app)

export default app
