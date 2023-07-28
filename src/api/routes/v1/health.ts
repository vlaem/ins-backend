import { Hono } from 'hono'
const HealthRoute = new Hono()

/**
 * @openapi
 * /v1/health:
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
HealthRoute.get('/', (c) => c.text('test'))

export default HealthRoute
