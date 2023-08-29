import { ResourceNotFoundError, ExtendedHonoError } from '~errors'
import * as TE from 'fp-ts/TaskEither'
import * as I from 'fp-ts/Identity'
import * as T from 'fp-ts/Task'
import * as UserRepo from '~/infrastructure/repositories/user-repository'
import * as UserRefreshTokenRepo from '~/infrastructure/repositories/user-refresh-token-repository'
import { transaction } from '~/infrastructure/repositories/transaction'
import { pipe } from 'fp-ts/function'

import {
  UserRefreshToken,
  createRefreshTokenForUser,
} from '~domain/models/user-refresh-token'
import { encodeAccessToken, generateAuthTokenPayload } from './access-token'
import { decodeFirebaseToken } from './firebase/firebase-admin'
import { User } from '~domain/models/user'

const findUserByEmail = (email: string) =>
  pipe(
    email,
    UserRepo.findByEmail,
    TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND'))
  )

const findUserById = (userId: string) =>
  pipe(
    userId,
    UserRepo.findById,
    TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND'))
  )

const generateTokenGroupForUser = (user: User) =>
  pipe(
    T.Do,
    T.apS('accessTokenGroup', pipe(user, encodeAccessToken, T.of)),
    T.apS('userRefreshToken', pipe(user, createRefreshTokenForUser))
  )

const findRefreshTokenById = (
  refreshTokenId: string
): TE.TaskEither<ExtendedHonoError, UserRefreshToken> =>
  pipe(
    refreshTokenId,
    UserRefreshTokenRepo.findNonExpiredById,
    TE.fromTaskOption(() =>
      ResourceNotFoundError.of('REFRESH_NOT_FOUND_OR_EXPIRED')
    )
  )

export const loginWithFirebaseToken = (idToken: string) =>
  pipe(
    idToken,
    decodeFirebaseToken,
    TE.flatMap((x) => pipe(x, (x) => x.email, findUserByEmail)),
    TE.flatMapTask(generateTokenGroupForUser),
    TE.tap(({ userRefreshToken }) =>
      pipe(userRefreshToken, UserRefreshTokenRepo.save, TE.of)
    ),
    TE.map(({ userRefreshToken, accessTokenGroup }) =>
      pipe(
        generateAuthTokenPayload,
        I.ap(accessTokenGroup),
        I.ap(userRefreshToken)
      )
    )
  )

export const logout = (refreshTokenId: string) =>
  pipe(
    refreshTokenId,
    findRefreshTokenById,
    TE.flatMapTask((x) => pipe(x, UserRefreshTokenRepo.destroy))
  )

export const refresh = (refreshTokenId: string) =>
  pipe(
    TE.Do,
    TE.bind('previousRefreshToken', () =>
      pipe(refreshTokenId, findRefreshTokenById)
    ),
    TE.bind('user', ({ previousRefreshToken }) =>
      pipe(previousRefreshToken.userId, findUserById)
    ),
    TE.bindW('userRefreshToken', ({ user }) =>
      pipe(user, createRefreshTokenForUser, TE.fromTask)
    ),
    TE.bindW('accessTokenGroup', ({ user }) =>
      pipe(user, encodeAccessToken, TE.of)
    ),
    TE.tap(({ previousRefreshToken, userRefreshToken, user }) =>
      transaction([
        UserRepo.save(user),
        UserRefreshTokenRepo.save(userRefreshToken),
        UserRefreshTokenRepo.destroy(previousRefreshToken),
      ])
    ),
    TE.map(({ userRefreshToken, accessTokenGroup }) =>
      pipe(
        generateAuthTokenPayload,
        I.ap(accessTokenGroup),
        I.ap(userRefreshToken)
      )
    )
  )
