import { Hono } from 'hono'

const HealthRoute = new Hono()

HealthRoute.get('/', (c) => c.text('test'))

export default HealthRoute
