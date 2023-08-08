import { MiddlewareHandler } from 'hono'
import { AuthService } from '~/modules/auth'

export function createAuthorizeMiddleware(
  authService: AuthService
): AuthorizeMiddleware {
  return () => {
    return async (c, next) => {
      const authHeader = c.req.header('Authorization')

      if (!authHeader) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const [type, token] = authHeader.split(' ')

      if (type !== 'Bearer') {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const payload = await authService.verifyToken(token)

      if (payload === null) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      c.set(userSessionKey, {
        userId: payload.id,
        email: payload.email,
      })

      c.get('logger')

      await next()
    }
  }
}

const userSessionKey = 'user-session'

export type AuthorizeMiddleware = () => MiddlewareHandler

export const getUserSession = (c: any): UserSession => {
  const userSession = c.get(userSessionKey)
  return userSession
}

export interface UserSession {
  userId: string
  email: string
}
