import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AuthService } from 'src/modules/auth'

const InvitesRoute = new Hono()

const redeemEmailPasswordSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().trim(),
})

InvitesRoute.patch(
  '/:linkInviteCode/redeem-email-password',
  zValidator('json', redeemEmailPasswordSchema),
  async (c) => {
    const data = c.req.valid('json')
    const linkInviteCode = c.req.param('linkInviteCode')

    await AuthService.redeemLinkInvite(
      linkInviteCode,
      data.email,
      data.password
    )

    return c.json({}, 200)
  }
)

export default InvitesRoute
