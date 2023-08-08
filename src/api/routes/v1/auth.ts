import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AuthService } from '~/modules/auth'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

export function createAuthRoute(authService: AuthService) {
  const AuthRoute = new Hono()

  const firebaseLoginSchema = z.object({
    firebaseToken: z.string().trim().nonempty(),
  })

  AuthRoute.post(
    '/login-with-firebase',
    zValidator('json', firebaseLoginSchema),
    async (c) => {
      const data = c.req.valid('json')

      const payload = await authService.firebaseLogin(data.firebaseToken)

      setCookie(c, 'refresh_token', payload.refreshToken, {
        httpOnly: true,
      })

      return c.json(
        {
          accessToken: payload.accessToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt.toISO(),
        },
        200
      )
    }
  )

  AuthRoute.post('/refresh', async (c) => {
    const refreshToken = getCookie(c, 'refresh_token')

    // If there is no refresh token, return 401
    if (!refreshToken) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const payload = await authService.refresh(refreshToken)

    setCookie(c, 'refresh_token', payload.refreshToken, {
      httpOnly: true,
    })

    return c.json(
      {
        accessToken: payload.accessToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt.toISO(),
      },
      200
    )
  })

  AuthRoute.post('/logout', async (c) => {
    const refreshToken = getCookie(c, 'refresh_token')

    // If there is no refresh token, return 401
    if (!refreshToken) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    await authService.logout(refreshToken)

    deleteCookie(c, 'refresh_token')

    return c.json({ message: 'Logout successful.' }, 200)
  })

  return AuthRoute
}

export type AuthRoute = ReturnType<typeof createAuthRoute>
