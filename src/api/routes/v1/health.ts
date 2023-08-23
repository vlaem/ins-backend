import { Hono } from 'hono'

export const HealthRoute = new Hono()

HealthRoute.get('/', (c) =>
  c.json({
    status: 'OK',
  })
)
