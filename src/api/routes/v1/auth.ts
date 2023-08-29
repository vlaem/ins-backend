import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {
  loginWithFirebaseToken,
  logout,
  refresh,
} from '~/modules/authentication/login'
import { AuthTokenPayload } from '~/modules/authentication/access-token'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { UnauthorizedError } from '~errors'

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
      (data) => data.firebaseToken,
      loginWithFirebaseToken,
      TE.tap((x) => pipe(x, setRefreshTokenCookie, TE.of)),
      TE.map(transformPayload),
      TE.match(
        (e) => pipe({ message: e.code }, jsonResponse(e.status)),
        (payload) => pipe(payload, jsonResponse(200))
      )
    )()
  }
)

AuthRoute.post('/refresh', (c) => {
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
    getCookie(c, 'refresh_token'),
    TE.fromNullable(UnauthorizedError.of()),
    TE.flatMap(refresh),
    TE.tap((x) => pipe(x, setRefreshTokenCookie, TE.of)),
    TE.map(transformPayload),
    TE.match(
      (e) => pipe({ message: e.code }, jsonResponse(e.status)),
      (payload) => pipe(payload, jsonResponse(200))
    )
  )()
})

AuthRoute.post('/logout', (c) => {
  const jsonResponse = (status: number) => (payload: any) =>
    c.json(payload, status)

  const deleteRefreshTokenCookie = () => {
    deleteCookie(c, 'refresh_token')
  }

  return pipe(
    getCookie(c, 'refresh_token'),
    TE.fromNullable(UnauthorizedError.of()),
    TE.flatMap(logout),
    TE.tap(() => pipe(deleteRefreshTokenCookie, TE.of)),
    TE.match(
      (e) => pipe({ message: e.code }, jsonResponse(e.status)),
      () => pipe({ message: 'Logout successful.' }, jsonResponse(200))
    )
  )()
})
