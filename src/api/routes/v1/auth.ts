import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {
  firebaseLogin,
  AuthTokenPayload,
} from '~/modules/auth/app-services/auth-service'
import { setCookie } from 'hono/cookie'
import * as TE from 'fp-ts/TaskEither'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

export const AuthRoute = new Hono()

const firebaseLoginSchema = z.object({
  firebaseToken: z.string().trim().nonempty(),
})

AuthRoute.post(
  '/login-with-firebase',
  zValidator('json', firebaseLoginSchema),
  async (c) => {
    const setRefreshTokenCookie = (payload: AuthTokenPayload) => () => {
      setCookie(c, 'refresh_token', payload.refreshToken, {
        httpOnly: true,
        expires: payload.refreshTokenExpiresAt.toJSDate(),
        path: '/',
      })
    }

    const transformPayload = (payload: AuthTokenPayload) => ({
      accessToken: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt.toISO(),
    })

    const jsonResponse = (status: number) => (payload: any) =>
      c.json(payload, status)

    return pipe(
      c.req.valid('json'),
      (x) => x.firebaseToken,
      firebaseLogin,
      TE.match(
        (e) => pipe({ message: e.code }, jsonResponse(e.status)),
        (payload) =>
          pipe(
            payload,
            IO.of,
            IO.tap(setRefreshTokenCookie),
            IO.map(transformPayload),
            IO.map(jsonResponse(200))
          )()
      )
    )()
  }
)
/*
  AuthRoute.post('/refresh', async (c) => {
    const refreshToken = getCookie(c, 'refresh_token')

    // If there is no refresh token, return 401
    if (!refreshToken) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const payload = await authService.refresh(refreshToken)

    setCookie(c, 'refresh_token', payload.refreshToken, {
      httpOnly: true,
      expires: payload.refreshTokenExpiresAt.toJSDate(),
      path: '/',
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


*/
