jest.mock('src/shared/db')

import AuthRoute from './auth'
import { AuthService } from 'src/modules/auth'

jest.mock('src/modules/auth')
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('AuthRoute', () => {
  describe('login-with-firebase', () => {
    it('should return 200', async () => {
      mockedAuthService.firebaseLogin.mockResolvedValue({
        accessToken: 'unique-access-token',
        refreshToken: 'unique-refresh-token',
      })

      const response = await AuthRoute.request('/login-with-firebase', {
        method: 'POST',
        body: JSON.stringify({
          firebaseToken: 'firebaseToken',
        }),
      })

      expect(response.headers.get('Set-Cookie')).toBe(
        'refresh_token=unique-refresh-token; HttpOnly'
      )

      expect(response.status).toBe(200)
    })
  })
  describe('refresh', () => {
    it('should return 401 if no refresh token', async () => {
      const response = await AuthRoute.request('/refresh', {
        method: 'POST',
      })

      expect(response.status).toBe(401)
    })
    it('should return 200', async () => {
      mockedAuthService.refresh.mockResolvedValue({
        accessToken: 'unique-access-token',
        refreshToken: 'new-unqiue-refresh-token',
      })

      const response = await AuthRoute.request('/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refresh_token=unique-refresh-token',
        },
      })

      expect(response.headers.get('Set-Cookie')).toBe(
        'refresh_token=new-unqiue-refresh-token; HttpOnly'
      )
      expect(response.status).toBe(200)
    })
  })
})
