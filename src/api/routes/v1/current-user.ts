import { Hono } from 'hono'
import { CurrentUserQueryService } from '~/modules/auth'
import {
  AuthorizeMiddleware,
  getUserSession,
} from '~/api/middlewares/authorize'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { flow, pipe } from 'fp-ts/function'

export function createCurrentUserRoute(
  currentUserQueryService: CurrentUserQueryService,
  authorize: AuthorizeMiddleware
) {
  const CurrentUserRoute = new Hono()

  CurrentUserRoute.get('/', authorize(), (c) => {
    return pipe(
      c,
      getUserSession,
      (x) => x.userId,
      currentUserQueryService.getCurrentUser,
      T.map(
        O.match(
          () => c.json({ code: 'USER_NOT_FOUND' }, 404),
          (x) => c.json(x, 200)
        )
      )
    )()
  })

  return CurrentUserRoute
}

export type CurrentUserRoute = ReturnType<typeof createCurrentUserRoute>
