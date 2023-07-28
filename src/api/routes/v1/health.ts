import { Hono } from 'hono'

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     description: Health check
 *     operationId: health
 *     responses:
 *       '200':
 *         description: OK
 */

const HealthRoute = new Hono()

HealthRoute.get('/', (c) => c.text('test'))

export default HealthRoute
