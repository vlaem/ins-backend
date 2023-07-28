import { Hono } from 'hono'
const HealthRoute = new Hono()

HealthRoute.get('/', (c) =>
  c.json({
    status: 'OK',
  })
)

export default HealthRoute
