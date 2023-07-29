import spec from './swagger'
import HealthRoute from './health'
import AuthRoute from './auth'
import { Hono } from 'hono'

const V1Route = new Hono()

V1Route.route('/health', HealthRoute)
V1Route.route('/auth', AuthRoute)

V1Route.get('/swagger.json', (c) => {
  c.header('Content-Type', 'application/json')
  return c.json(spec, 200)
})

export default V1Route
