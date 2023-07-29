import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AuthService } from 'src/modules/auth'

const AuthRoute = new Hono()

const passwordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

AuthRoute.post('/login', zValidator('json', passwordLoginSchema), async (c) => {
  const data = c.req.valid('json')

  const { token, refreshToken } = await AuthService.passwordLogin(
    data.email,
    data.password
  )

  return c.json(
    {
      token,
      refreshToken,
    },
    200
  )
})

export default AuthRoute
