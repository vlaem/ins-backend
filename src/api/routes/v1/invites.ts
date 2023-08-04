import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AuthService, InviteQueryService } from 'src/modules/auth'
import { setCookie } from 'hono/cookie'

const InvitesRoute = new Hono()

InvitesRoute.get('/:inviteCode', async (c) => {
  const inviteCode = c.req.param('inviteCode')
  const result = await InviteQueryService.getInvite(inviteCode)
  return c.jsonT(result, 200)
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
    const payload = await AuthService.redeemInvitaWithFirebaseToken(
      inviteCode,
      data.firebaseToken
    )

    setCookie(c, 'refresh_token', payload.refreshToken, {
      httpOnly: true,
    })

    return c.jsonT(
      {
        accessToken: payload.accessToken,
      },
      200
    )
  }
)

export default InvitesRoute
