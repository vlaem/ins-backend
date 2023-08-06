import { Hono } from 'hono'

export function createHealthRoute() {
  const HealthRoute = new Hono()

  HealthRoute.get('/', (c) =>
    c.json({
      status: 'OK',
    })
  )

  return HealthRoute
}
