import { Hono } from 'hono'
import { CurrentUserQueryService } from '~/modules/auth'
import {
  AuthorizeMiddleware,
  getUserSession,
} from '~/api/middlewares/authorize'

export function createCurrentUserRoute(
  currentUserQueryService: CurrentUserQueryService,
  authorize: AuthorizeMiddleware
) {
  const CurrentUserRoute = new Hono()

  CurrentUserRoute.get('/', authorize(), async (c) => {
    const userSession = getUserSession(c)

    const currentUser = await currentUserQueryService.getCurrentUser(
      userSession.userId
    )

    return c.json(currentUser, 200)
  })

  return CurrentUserRoute
}

export type CurrentUserRoute = ReturnType<typeof createCurrentUserRoute>
