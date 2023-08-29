import { Hono } from 'hono'
import { getCurrentUser } from '~/modules/authentication/current-user'
import { authorize, getUserSession } from '~/api/middlewares/authorize'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

export const CurrentUserRoute = new Hono()

CurrentUserRoute.get('/', authorize(), (c) => {
  const jsonResponse = (status: number) => (payload: any) =>
    c.json(payload, status)

  return pipe(
    getUserSession(c),
    (x) => x.userId,
    getCurrentUser,
    TE.match(
      (e) => pipe({ message: e.code }, jsonResponse(e.status)),
      (payload) => pipe(payload, jsonResponse(200))
    )
  )()
})
