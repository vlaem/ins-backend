import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const setupSwagger = (app: Hono) => {
  app.use(
    '/api-docs/*',
    serveStatic({
      root: './node_modules/swagger-ui-dist',
      rewriteRequestPath: (path) => path.replace('/api-docs', ''),
    })
  )

  return app
}

export default setupSwagger
