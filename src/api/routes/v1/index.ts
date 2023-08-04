import HealthRoute from './health'
import AuthRoute from './auth'
import InvitesRoute from './invites'
import { Hono } from 'hono'
import { honoSwaggerJsdoc } from 'src/api/hono-swagger'

const V1Route = new Hono()

V1Route.route('/health', HealthRoute)
V1Route.route('/auth', AuthRoute)
V1Route.route('/invites', InvitesRoute)
V1Route.get(
  '/swagger.json',
  honoSwaggerJsdoc({
    failOnErrors: true,
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'INS API v1',
        version: '1.0.0',
      },
    },
    apis: ['./src/api/routes/v1/**/*.ts', './src/api/routes/v1/**/*.yaml'],
  })
)

export default V1Route
