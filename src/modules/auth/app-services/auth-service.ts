import { DateTime } from 'luxon'
import {
  decodeFirebaseToken,
  FirebaseDecodedUserData,
} from '~/modules/auth/infra/firebase/firebase-admin'
import {
  findUserByEmail,
  findUserById,
} from '~/modules/auth/infra/repositories/user-repository'
import {
  saveRefreshToken,
  findRefreshTokenNonExpiredById,
  deleteRefreshToken,
} from '~/modules/auth/infra/repositories/user-refresh-token-repository'
import { findOneNonExpiredById } from '~/modules/auth/infra/repositories/invite-repository'
import { UserRefreshToken } from '~/modules/auth/domain/models/user-refresh-token'
import { User } from '~/modules/auth/domain/models/user'
import {
  ResourceNotFoundError,
  InvalidOperationError,
  SystemError,
} from '~errors'
import * as TE from 'fp-ts/TaskEither'
import * as TO from 'fp-ts/TaskOption'
import * as I from 'fp-ts/Identity'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import { pipe, flow } from 'fp-ts/function'
import { encodeJWT, EncodeResult } from '~/modules/auth/infra/jwt/jwt-helper'
import { sequelize } from '~/shared/db/sq'

export interface AuthTokenPayload {
  accessToken: string
  accessTokenExpiresAt: DateTime
  refreshToken: string
  refreshTokenExpiresAt: DateTime
}

interface TokenGroup {
  encodeResult: EncodeResult
  userRefreshToken: UserRefreshToken
}

const generateTokenGroupForUser = (user: User): T.Task<TokenGroup> =>
  pipe(
    T.Do,
    T.apS('encodeResult', pipe(user, encodeJWT, T.of)),
    T.apS('userRefreshToken', pipe(user.id, UserRefreshToken.create))
  )

const tokenGroupToAuthTokenPayload = (
  userTokenGroup: TokenGroup
): AuthTokenPayload =>
  pipe(
    I.Do,
    I.bind('accessToken', () => userTokenGroup.encodeResult.accessToken),
    I.bind(
      'accessTokenExpiresAt',
      () => userTokenGroup.encodeResult.accessTokenExpiresAt
    ),
    I.bind('refreshToken', () => userTokenGroup.userRefreshToken.id),
    I.bind(
      'refreshTokenExpiresAt',
      () => userTokenGroup.userRefreshToken.expiresAt
    )
  )

const findUserFromDecoded = (
  firebaseDecodedUserData: FirebaseDecodedUserData
) =>
  pipe(
    firebaseDecodedUserData,
    (x) => x.email,
    findUserByEmail,
    TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND'))
  )

export const firebaseLogin = (idToken: string) =>
  pipe(
    idToken,
    decodeFirebaseToken,
    TE.flatMap(findUserFromDecoded),
    TE.flatMapTask(generateTokenGroupForUser),
    TE.tap((x) => pipe(x.userRefreshToken, saveRefreshToken, TE.of)),
    TE.map(tokenGroupToAuthTokenPayload)
  )

const getValidRefreshToken = (refreshTokenId: string) =>
  pipe(
    refreshTokenId,
    findRefreshTokenNonExpiredById,
    TE.fromTaskOption(() => ResourceNotFoundError.of('REFRESH_TOKEN_NOT_FOUND'))
  )

const persistRefreshOperation =
  (previousRefreshToken: UserRefreshToken) =>
  (nextRefreshToken: UserRefreshToken) =>
    TE.tryCatch(
      () =>
        sequelize.transaction(
          pipe(
            () => pipe(previousRefreshToken, deleteRefreshToken),
            () => pipe(nextRefreshToken, saveRefreshToken)
          )
        ),
      () => SystemError.of('TRANSACTION_ERROR')
    )

const getExistingUserById = (userId: string) =>
  pipe(
    userId,
    findUserById,
    TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND'))
  )

export const refresh = (refreshTokenId: string) =>
  pipe(
    refreshTokenId,
    getValidRefreshToken,
    TE.map((x) =>
      pipe(
        I.Do,
        I.bind('previousRefreshToken', () => x)
      )
    ),
    TE.flatMap(({ previousRefreshToken }) =>
      pipe(
        TE.Do,
        TE.apS('user', getExistingUserById(previousRefreshToken.userId)),
        TE.apS('previousRefreshToken', TE.of(previousRefreshToken))
      )
    ),
    TE.flatMap((x) =>
      pipe(
        TE.Do,
        TE.apS('encodeResult', pipe(x.user, encodeJWT, TE.of)),
        TE.apS(
          'userRefreshToken',
          pipe(x.previousRefreshToken, UserRefreshToken.extendFrom, TE.fromTask)
        ),
        TE.apS('previousRefreshToken', pipe(x.previousRefreshToken, TE.of))
      )
    ),
    TE.tap(({ previousRefreshToken, userRefreshToken }) =>
      pipe(
        persistRefreshOperation,
        I.ap(previousRefreshToken),
        I.ap(userRefreshToken)
      )
    ),
    TE.map(tokenGroupToAuthTokenPayload)
  )

export const logout = (refreshTokenId: string) =>
  pipe(refreshTokenId, getValidRefreshToken, TE.map(deleteRefreshToken))

export const redeemInvitaWithFirebaseToken =
  (inviteCode: string) => (firebaseToken: string) => {
    const checkEmailAvailability = (decodedUserData: FirebaseDecodedUserData) =>
      pipe(
        decodedUserData,
        (x) => x.email,
        findUserByEmail,
        TO.match(
          () => TE.left(InvalidOperationError.of('EMAIL_ALREADY_IN_USE')),
          () => TE.right(decodedUserData)
        ),
        TE.fromTask,
        TE.flatten
      )

    const findValidInvite = (inviteCode: string) =>
      pipe(
        inviteCode,
        findOneNonExpiredById,
        TE.fromTaskOption(() =>
          ResourceNotFoundError.of('LINK_INVITE_NOT_FOUND')
        )
      )

    return pipe(
      inviteCode,
      findValidInvite,
      TE.flap
    )
  }

/**
//   async redeemInvitaWithFirebaseToken(
//     inviteCode: string,
//     firebaseToken: string
//   ): Promise<AuthTokenPayload> {
//     const invite = await this.inviteRepository.findOneNonExpiredById(inviteCode)

//     if (!invite) {
//       throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
//     }

//     const decodedToken = await this.firebaseAdmin.decodeToken(firebaseToken)

//     const user = await this.userRepository.findByEmail(decodedToken.email)

//     if (user) {
//       throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
//     }

//     const newUser = User.createWithFirebaseUid(
//       decodedToken.email,
//       decodedToken.uid
//     )

//     const newTokenGroup = this.generateTokenAndRefresh({
//       id: newUser.id,
//       email: newUser.email,
//     })

//     await this.sequelize.transaction(async () => {
//       await this.userRepository.add(newUser)
//       await this.inviteRepository.destroy(invite)
//       await this.userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
//     })

//     return {
//       accessToken: newTokenGroup.accessToken,
//       accessTokenExpiresAt: newTokenGroup.accessTokenExpiresAt,
//       refreshToken: newTokenGroup.userRefreshToken.id,
//       refreshTokenExpiresAt: newTokenGroup.userRefreshToken.expiresAt,
//     }
//   }

//   async verifyToken(token: string): Promise<JwtPayload | null> {
//     try {
//       const payload = this.jwtHelper.decode(token)
//       return payload
//     } catch (err) {
//       this.logger.error(err)
//       return null
//     }
//   }
// }
*/
