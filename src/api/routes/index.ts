import V1Route from './v1'
import { Hono } from 'hono'

const setupRoutes = (app: Hono) => {
  app.route('/v1', V1Route)
  return app
}

export default setupRoutes
