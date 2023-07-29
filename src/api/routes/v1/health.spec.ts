import HealthRoute from './health'

describe('HealthRoute', () => {
  it('should return 200', async () => {
    const response = await HealthRoute.request('/')
    expect(response.status).toBe(200)
  })
})
