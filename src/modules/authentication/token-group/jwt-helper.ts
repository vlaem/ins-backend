import jwt from 'jsonwebtoken'
import { DateTime, Duration } from 'luxon'
import * as JWTConfig from '~config/jwt-config'
import { pipe } from 'fp-ts/function'
import { User } from '~domain/models/user'
import * as E from 'fp-ts/Either'
import * as I from 'fp-ts/Identity'
import { UnauthorizedError } from '~/shared/errors'

interface JwtDates {
  issuedAt: DateTime
  expiresAt: DateTime
}

export interface AccessTokenGroup {
  accessToken: string
  accessTokenExpiresAt: DateTime
}

interface JWTPayload {
  iat: number
  exp: number
  id: string
  email: string
}

const getIssuedAtDate = () => DateTime.now()
const getExpiresAtDate = (duration: Duration) => (issuedAt: DateTime) =>
  issuedAt.plus(duration)

const calculateJWTDates = (): JwtDates =>
  pipe(
    I.Do,
    I.bind('issuedAt', () => getIssuedAtDate()),
    I.bind('expiresAt', ({ issuedAt }) =>
      pipe(issuedAt, getExpiresAtDate(JWTConfig.getDuration()))
    )
  )

const generatePayload =
  (user: User) =>
  (dates: JwtDates): JWTPayload =>
    pipe(
      I.Do,
      I.bind('iat', () => Math.trunc(dates.issuedAt.toSeconds())),
      I.bind('exp', () => Math.trunc(dates.expiresAt.toSeconds())),
      I.bind('id', () => user.id),
      I.bind('email', () => user.email)
    )

const signPayload = (secret: string) => (payload: JWTPayload) =>
  pipe(payload, (x) => jwt.sign(x, secret))

export const encodeAccessToken = (user: User): AccessTokenGroup =>
  pipe(
    I.Do,
    I.bind('dates', calculateJWTDates),
    I.bind('accessToken', ({ dates }) =>
      pipe(dates, generatePayload(user), signPayload(JWTConfig.getSecret()))
    ),
    I.bind('accessTokenExpiresAt', ({ dates }) => dates.expiresAt),
    I.map(({ accessToken, accessTokenExpiresAt }) => ({
      accessToken,
      accessTokenExpiresAt,
    }))
  )

const verify = (token: string) =>
  jwt.verify(token, JWTConfig.getSecret()) as JWTPayload

export const decodeAccessToken = (token: string) =>
  E.tryCatch(
    () => verify(token),
    () => UnauthorizedError.of()
  )
