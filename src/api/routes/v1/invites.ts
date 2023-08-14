import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AuthService, InviteQueryService } from '~/modules/auth'
import { setCookie } from 'hono/cookie'

export function createInviteRoute(
  authService: AuthService,
  inviteQueryService: InviteQueryService
) {
  const InvitesRoute = new Hono()

  InvitesRoute.get('/:inviteCode', async (c) => {
    const inviteCode = c.req.param('inviteCode')

    const result = await inviteQueryService.getInvite(inviteCode)
    return c.json(result, 200)
  })

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

  return InvitesRoute
}

export type InviteRoute = ReturnType<typeof createInviteRoute>
