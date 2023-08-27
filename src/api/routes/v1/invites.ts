import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { findValidInvite } from '~/modules/authentication/queries'
import * as TE from 'fp-ts/TaskEither'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

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

/*
const redeemFirebase = z.object({
  firebaseToken: z.string().trim().nonempty(),
})

  InvitesRoute.patch(
    '/:inviteCode/redeem-firebase',
    zValidator('json', redeemFirebase),
    async (c) => {
      const data = c.req.valid('json')
      const inviteCode = c.req.param('inviteCode')
      const payload = await authService.redeemInvitaWithFirebaseToken(
        inviteCode,
        data.firebaseToken
      )

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
    }
  )
*/
