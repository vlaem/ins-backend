import AuthRoute from './auth'
import { AuthService } from 'src/modules/auth'

jest.mock('src/modules/auth')
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('Auth', () => {
  it('should return 200', async () => {
    mockedAuthService.passwordLogin.mockResolvedValue({
      token: 'token',
      refreshToken: 'refreshToken',
    })

    const response = await AuthRoute.request('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'email@test.io',
        password: 'password',
      }),
    })

    expect(response.status).toBe(200)
  })
})
