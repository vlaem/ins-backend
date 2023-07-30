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
    await AuthService.redeemInvite(inviteCode, data.email, data.password)
    return c.json({}, 200)
  }
)

export default InvitesRoute
