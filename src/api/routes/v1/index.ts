import spec from './swagger'
import HealthRoute from './health'
import { Hono } from 'hono'

const V1Route = new Hono()

V1Route.route('/health', HealthRoute)

V1Route.get('/swagger.json', (c) => {
  c.header('Content-Type', 'application/json')
  return c.text(JSON.stringify(spec), 200)
})

export default V1Route
