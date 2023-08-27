import { DateTime } from 'luxon'
import { UserRefreshToken } from '~domain/models/user-refresh-token'
import * as I from 'fp-ts/Identity'
import { pipe } from 'fp-ts/function'
import { AccessTokenGroup } from './jwt-helper'

export interface AuthTokenPayload {
  accessToken: string
  accessTokenExpiresAt: DateTime
  refreshToken: string
  refreshTokenExpiresAt: DateTime
}

export interface TokenGroup {
  accessTokenGroup: AccessTokenGroup
  userRefreshToken: UserRefreshToken
}

export const generateAuthTokenPayload =
  (accessTokenGroup: AccessTokenGroup) =>
  (userRefreshToken: UserRefreshToken) =>
    pipe(
      I.Do,
      I.bind('accessToken', () => accessTokenGroup.accessToken),
      I.bind(
        'accessTokenExpiresAt',
        () => accessTokenGroup.accessTokenExpiresAt
      ),
      I.bind('refreshToken', () => userRefreshToken.id),
      I.bind('refreshTokenExpiresAt', () => userRefreshToken.expiresAt)
    )
