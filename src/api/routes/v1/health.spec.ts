import HealthRoute from './health'

describe('Health', () => {
  it('should return 200', async () => {
    const response = await HealthRoute.request('/')
    expect(response.status).toBe(200)
  })
})
