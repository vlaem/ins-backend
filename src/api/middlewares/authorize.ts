import { MiddlewareHandler, Context } from 'hono'

import {
  decodeAccessToken,
  JWTPayload,
} from '~/modules/authentication/access-token'
import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/string'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { UnauthorizedError } from '~/shared/errors'

const getAccessTokenFromHeader = (authHeader: string) =>
  pipe(
    O.Do,
    O.bind('authHeaderParts', () =>
      pipe(
        authHeader,
        S.split(' '),
        O.fromPredicate((x) => x.length === 2)
      )
    ),
    O.bind('type', ({ authHeaderParts }) =>
      pipe(
        authHeaderParts,
        (x) => x[0],
        O.fromPredicate((x) => x === 'Bearer')
      )
    ),
    O.bind('token', ({ authHeaderParts }) =>
      pipe(authHeaderParts, (x) => x[1], O.fromNullable)
    ),
    O.map((x) => x.token)
  )

export function authorize(): MiddlewareHandler {
  return async (c, next) => {
    const setUserSesion = (payload: JWTPayload) => {
      c.set(userSessionKey, {
        userId: payload.id,
        email: payload.email,
      })
    }

    const jsonResponse = (status: number) => (payload: any) =>
      c.json(payload, status)

    return pipe(
      c.req.header('Authorization'),
      O.fromNullable,
      O.flatMap(getAccessTokenFromHeader),
      O.map(decodeAccessToken),
      E.fromOption(() => UnauthorizedError.of()),
      E.flatten,
      E.tap((x) => pipe(x, setUserSesion, E.of)),
      TE.fromEither,
      TE.match(
        (e) => pipe({ message: e.code }, jsonResponse(e.status)),
        () => next()
      )
    )()
  }
}

const userSessionKey = 'user-session'

export const getUserSession = (c: Context): UserSession => c.get(userSessionKey)

export interface UserSession {
  userId: string
  email: string
}
