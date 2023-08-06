import { createHealthRoute } from './health'
import { createAuthRoute } from './auth'
import { createInviteRoute } from './invites'
import { Hono } from 'hono'
import { honoSwaggerJsdoc } from 'hono-swagger-jsdoc'

export function createV1Route(
  healthRoute: ReturnType<typeof createHealthRoute>,
  authRoute: ReturnType<typeof createAuthRoute>,
  inviteRoute: ReturnType<typeof createInviteRoute>
) {
  const V1Route = new Hono()

  V1Route.route('/health', healthRoute)
  V1Route.route('/auth', authRoute)
  V1Route.route('/invites', inviteRoute)

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

  return V1Route
}

export { createHealthRoute, createAuthRoute, createInviteRoute }
