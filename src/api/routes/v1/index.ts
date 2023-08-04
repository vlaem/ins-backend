import spec from './swagger'
import HealthRoute from './health'
import AuthRoute from './auth'
import InvitesRoute from './invites'
import { Hono } from 'hono'

const V1Route = new Hono()

V1Route.route('/health', HealthRoute)
V1Route.route('/auth', AuthRoute)
V1Route.route('/invites', InvitesRoute)

V1Route.get('/swagger.json', (c) => {
  c.header('Content-Type', 'application/json')
  return c.jsonT(spec, 200)
})

export default V1Route
