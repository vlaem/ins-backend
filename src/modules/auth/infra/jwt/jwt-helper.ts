import jwt from 'jsonwebtoken'
import { DateTime, Duration } from 'luxon'
import * as JWTConfig from '~config/jwt-config'
import { pipe } from 'fp-ts/function'
import { User } from '~/modules/auth/domain/models/user'
import * as E from 'fp-ts/Either'
import * as I from 'fp-ts/Identity'
import { UnauthorizedError } from '~/shared/errors'

interface JwtDates {
  issuedAt: DateTime
  expiresAt: DateTime
}

export interface EncodeResult {
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

export const encodeJWT = (user: User): EncodeResult =>
  pipe(
    calculateJWTDates(),
    I.map((x) =>
      pipe(
        I.Do,
        I.bind('accessToken', () =>
          pipe(x, generatePayload(user), signPayload(JWTConfig.getSecret()))
        ),
        I.bind('accessTokenExpiresAt', () => x.expiresAt)
      )
    )
  )

const verify = (token: string) =>
  jwt.verify(token, JWTConfig.getSecret()) as JWTPayload

export const decodeJWT = (token: string) =>
  E.tryCatch(
    () => verify(token),
    () => UnauthorizedError.of()
  )
