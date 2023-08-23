import { HealthRoute } from './v1/health'
import { Hono } from 'hono'
import { honoSwaggerJsdoc } from 'hono-swagger-jsdoc'
import { AuthRoute } from './v1/auth'

export const V1Route = new Hono()

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
    apis:
      process.env.NODE_ENV === 'production'
        ? ['./dist/docs/v1/**/*.yaml']
        : ['./src/api/routes/v1/docs/**/*.yaml'],
  })
)
  .route('/health', HealthRoute)
  .route('/auth', AuthRoute)
