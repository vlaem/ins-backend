import { AuthRoute, createAuthRoute } from './auth'
import { AuthService } from '~/modules/auth'
import { DateTime, Settings as LuxonSettings } from 'luxon'
import { mock } from 'jest-mock-extended'

LuxonSettings.defaultZone = 'America/New_York'

describe('AuthRoute', () => {
  let AuthRoute: AuthRoute
  let mockedAuthService: ReturnType<typeof mock<AuthService>>

  beforeEach(() => {
    mockedAuthService = mock<AuthService>()
    AuthRoute = createAuthRoute(mockedAuthService)
  })

  describe('login-with-firebase', () => {
    it('should return 200', async () => {
      mockedAuthService.firebaseLogin.mockResolvedValue({
        accessToken: 'unique-access-token',
        refreshToken: 'unique-refresh-token',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
        refreshTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })

      const response = await AuthRoute.request('/login-with-firebase', {
        method: 'POST',
        body: JSON.stringify({
          firebaseToken: 'firebaseToken',
        }),
      })

      expect(response.headers.get('Set-Cookie')).toBe(
        'refresh_token=unique-refresh-token; Path=/; Expires=Fri, 01 Jan 2021 05:00:00 GMT; HttpOnly'
      )

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        accessToken: 'unique-access-token',
        accessTokenExpiresAt: '2021-01-01T00:00:00.000-05:00',
      })
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
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
        refreshTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })

      const response = await AuthRoute.request('/refresh', {
        method: 'POST',
        headers: {
          Cookie: 'refresh_token=unique-refresh-token',
        },
      })

      expect(response.headers.get('Set-Cookie')).toBe(
        'refresh_token=new-unqiue-refresh-token; Path=/; Expires=Fri, 01 Jan 2021 05:00:00 GMT; HttpOnly'
      )
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({
        accessToken: 'unique-access-token',
        accessTokenExpiresAt: '2021-01-01T00:00:00.000-05:00',
      })
    })
  })
})
