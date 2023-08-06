import { HealthRoute, createHealthRoute } from './health'

describe('HealthRoute', () => {
  let healthRoute: HealthRoute

  beforeEach(() => {
    healthRoute = createHealthRoute()
  })

  describe('GET /', () => {
    it('should return 200', async () => {
      const response = await healthRoute.request('/')
      expect(response.status).toBe(200)
    })
  })
})
