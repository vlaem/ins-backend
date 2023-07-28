import HealthRoute from './health'
import path from 'path'
import fs from 'fs'
import { Hono } from 'hono'

const V1Route = new Hono()

V1Route.route('/health', HealthRoute)

V1Route.get('/swagger.yaml', (c) => {
  c.header('Content-Type', 'text/yaml')

  const swaggerPath = path.resolve(__dirname, 'swagger.yaml')
  const file = fs.readFileSync(swaggerPath)
  return c.text(file.toString())
})

export default V1Route
