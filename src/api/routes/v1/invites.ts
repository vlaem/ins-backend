import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AuthService, InviteQueryService } from 'src/modules/auth'

const InvitesRoute = new Hono()

InvitesRoute.get('/:inviteCode', async (c) => {
  const inviteCode = c.req.param('inviteCode')
  const result = await InviteQueryService.getInvite(inviteCode)
  return c.json(result, 200)
})

const redeemEmailPasswordSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().trim(),
})

InvitesRoute.patch(
  '/:inviteCode/redeem-email-password',
  zValidator('json', redeemEmailPasswordSchema),
  async (c) => {
    const data = c.req.valid('json')
    const inviteCode = c.req.param('inviteCode')
    await AuthService.redeemInviteWithEmailAndPassword(
      inviteCode,
      data.email,
      data.password
    )
    return c.json({}, 200)
  }
)

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
    // Put the payload.refreshToken into a httpOnly cookie
    c.header(
      'Set-Cookie',
      `refreshToken=${payload.refreshToken}; HttpOnly; Path=/;`
    )

    return c.json(
      {
        accessToken: payload.accessToken,
      },
      200
    )
  }
)

export default InvitesRoute
