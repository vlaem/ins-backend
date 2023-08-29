import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import {
  findValidInvite,
  reedeemInviteWithFirebaseToken,
} from '~/modules/authentication/invites'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { setCookie } from 'hono/cookie'
import { AuthTokenPayload } from '~/modules/authentication/access-token'

export const InvitesRoute = new Hono()

InvitesRoute.get('/:inviteCode', async (c) => {
  const jsonResponse = (status: number) => (payload: any) =>
    c.json(payload, status)

  return pipe(
    c.req.param('inviteCode'),
    findValidInvite,
    TE.match(
      (e) => pipe({ message: e.code }, jsonResponse(e.status)),
      (inviteView) => pipe(inviteView, jsonResponse(200))
    )
  )()
})

const redeemFirebase = z.object({
  firebaseToken: z.string().trim().nonempty(),
})

InvitesRoute.patch(
  '/:inviteCode/redeem-firebase',
  zValidator('json', redeemFirebase),
  async (c) => {
    const data = c.req.valid('json')
    const firebaseToken = data.firebaseToken
    const inviteCode = c.req.param('inviteCode')

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
      inviteCode,
      reedeemInviteWithFirebaseToken(firebaseToken),
      TE.tap((x) => pipe(x, setRefreshTokenCookie, TE.of)),
      TE.map(transformPayload),
      TE.match(
        (e) => pipe({ message: e.code }, jsonResponse(e.status)),
        (payload) => pipe(payload, jsonResponse(200))
      )
    )()
  }
)
