import { HealthRoute } from './health'
import { AuthRoute } from './auth'
import { InviteRoute } from './invites'
import { CurrentUserRoute } from './current-user'
import { Hono } from 'hono'
import { honoSwaggerJsdoc } from 'hono-swagger-jsdoc'

export function createV1Route(
  healthRoute: HealthRoute,
  authRoute: AuthRoute,
  inviteRoute: InviteRoute,
  currentUserRoute: CurrentUserRoute
) {
  const V1Route = new Hono()

  V1Route.route('/health', healthRoute)
  V1Route.route('/auth', authRoute)
  V1Route.route('/invites', inviteRoute)
  V1Route.route('/current-user', currentUserRoute)

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
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/api/routes/v1/**/*.ts', './src/api/routes/v1/**/*.yaml'],
    })
  )

  return V1Route
}

export type V1Route = ReturnType<typeof createV1Route>
