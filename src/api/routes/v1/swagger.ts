import SwaggerJsdoc from 'swagger-jsdoc'

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'INS API v1',
      version: '0.0.1',
    },
  },
  apis: ['./src/api/routes/v1/*.ts', './src/api/routes/v1/*.yaml'],
}

const specs = SwaggerJsdoc(options)

export default specs
