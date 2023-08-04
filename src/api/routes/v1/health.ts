import { Hono } from 'hono'
const HealthRoute = new Hono()

HealthRoute.get('/', (c) =>
  c.jsonT({
    status: 'OK',
  })
)

export default HealthRoute
