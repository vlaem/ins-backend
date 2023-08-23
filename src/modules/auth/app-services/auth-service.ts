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
  findRefreshTokenById,
} from '~/modules/auth/infra/repositories/user-refresh-token-repository'
import { UserRefreshToken, User } from '~/modules/auth/domain/models'
import {
  ResourceNotFoundError,
  InvalidOperationError,
  ExtendedHonoError,
} from '~errors'
import * as TE from 'fp-ts/TaskEither'
import * as TO from 'fp-ts/TaskOption'
import * as I from 'fp-ts/Identity'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { pipe, flow } from 'fp-ts/function'
import { encodeJWT, EncodeResult } from '~/modules/auth/infra/jwt/jwt-helper'

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

const getRefreshToken = (refreshTokenId: string) =>
  pipe(
    refreshTokenId,
    findRefreshTokenById,
    TE.fromTaskOption(() => ResourceNotFoundError.of('REFRESH_TOKEN_NOT_FOUND'))
  )

export const refresh = (refreshToken: string) => {
  return pipe(
    refreshToken,
    getRefreshToken,
    TE.map((x) =>
      pipe(
        I.Do,
        I.bind('refreshToken', () => pipe(x, TE.of)),
        I.bind('user', () =>
          pipe(
            findUserById(x.userId),
            TE.fromTaskOption(() => ResourceNotFoundError.of('USER_NOT_FOUND')),
            TE.map(encodeJWT)
          )
        )
      )
    ),
  )
}

//   /**
//    * Generate a new token and refresh token from a previous non expired refresh token.
//    * It will destroy the previous refresh token.
//    * @param refreshToken - refresh token
//    * @returns
//    */
//   async refresh(refreshToken: string): Promise<AuthTokenPayload> {
//     this.logger.debug('AuthService.refresh', {
//       refreshToken,
//     })

//     const existingUserRefreshToken =
//       await this.userRefreshTokenRepository.findOneNonExpiredById(refreshToken)

//     if (!existingUserRefreshToken) {
//       throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
//     }

//     const user = await this.userRepository.findByPk(
//       existingUserRefreshToken.userId
//     )

//     if (!user) {
//       throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
//     }

//     const newTokenGroup = this.generateTokenAndRefresh({
//       id: user.id,
//       email: user.email,
//     })

//     await this.sequelize.transaction(async () => {
//       await this.userRefreshTokenRepository.destroy(existingUserRefreshToken)
//       await this.userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
//     })

//     return {
//       accessToken: newTokenGroup.accessToken,
//       accessTokenExpiresAt: newTokenGroup.accessTokenExpiresAt,
//       refreshToken: newTokenGroup.userRefreshToken.id,
//       refreshTokenExpiresAt: newTokenGroup.userRefreshToken.expiresAt,
//     }
//   }

/**


// export class AuthService {
//   private firebaseAdmin: FirebaseAdmin
//   private inviteRepository: InviteRepository
//   private userRefreshTokenRepository: UserRefreshTokenRepository
//   private userRepository: UserRepository
//   private jwtHelper: JwtHelper
//   private sequelize: Sequelize
//   private logger: Logger

//   constructor(
//     firebaseAdmin: FirebaseAdmin,
//     inviteRepository: InviteRepository,
//     userRefreshTokenRepository: UserRefreshTokenRepository,
//     userRepository: UserRepository,
//     jwtHelper: JwtHelper,
//     sequelize: Sequelize,
//     logger: Logger
//   ) {
//     this.firebaseAdmin = firebaseAdmin
//     this.inviteRepository = inviteRepository
//     this.userRefreshTokenRepository = userRefreshTokenRepository
//     this.userRepository = userRepository
//     this.jwtHelper = jwtHelper
//     this.sequelize = sequelize
//     this.logger = logger
//   }

//   /**
//    * Generate a token and a user refresh token for a given user.
//    * @param userData - user data
//    * @returns {TokenGroup}
//    */
//   private generateTokenAndRefresh(userData: UserData): TokenGroup {
//     const { accessToken, accessTokenExpiresAt } =
//       this.jwtHelper.encode(userData)
//     const userRefreshToken = UserRefreshToken.create(
//       userData.id,
//       DateTime.now().plus({ days: 30 })
//     )

//     return {
//       accessToken,
//       userRefreshToken,
//       accessTokenExpiresAt,
//     }
//   }

//   /**
//    * Authenticate user with email and password, returning a token and a refresh token.
//    * @param email - user email
//    * @param password - user password
//    * @returns {Promise<AuthTokenPayload>}
//    */
//   async passwordLogin(
//     email: string,
//     password: string
//   ): Promise<AuthTokenPayload> {
//     const user = await this.userRepository.findByEmail(email)

//     if (!user) {
//       throw new InvalidOperationError('INVALID_USEREMAIL_OR_PASSWORD')
//     }

//     const isValidPassword = await bycrypt.compare(password, user.password)

//     if (!isValidPassword) {
//       throw new InvalidOperationError('INVALID_USEREMAIL_OR_PASSWORD')
//     }

//     const tokenGroup = this.generateTokenAndRefresh({
//       id: user.id,
//       email: user.email,
//     })

//     await this.userRefreshTokenRepository.update(tokenGroup.userRefreshToken)

//     return {
//       accessToken: tokenGroup.accessToken,
//       accessTokenExpiresAt: tokenGroup.accessTokenExpiresAt,
//       refreshToken: tokenGroup.userRefreshToken.id,
//       refreshTokenExpiresAt: tokenGroup.userRefreshToken.expiresAt,
//     }
//   }

//   /**
//    * Generate a new token and refresh token from a previous non expired refresh token.
//    * It will destroy the previous refresh token.
//    * @param refreshToken - refresh token
//    * @returns
//    */
//   async refresh(refreshToken: string): Promise<AuthTokenPayload> {
//     this.logger.debug('AuthService.refresh', {
//       refreshToken,
//     })

//     const existingUserRefreshToken =
//       await this.userRefreshTokenRepository.findOneNonExpiredById(refreshToken)

//     if (!existingUserRefreshToken) {
//       throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
//     }

//     const user = await this.userRepository.findByPk(
//       existingUserRefreshToken.userId
//     )

//     if (!user) {
//       throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
//     }

//     const newTokenGroup = this.generateTokenAndRefresh({
//       id: user.id,
//       email: user.email,
//     })

//     await this.sequelize.transaction(async () => {
//       await this.userRefreshTokenRepository.destroy(existingUserRefreshToken)
//       await this.userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
//     })

//     return {
//       accessToken: newTokenGroup.accessToken,
//       accessTokenExpiresAt: newTokenGroup.accessTokenExpiresAt,
//       refreshToken: newTokenGroup.userRefreshToken.id,
//       refreshTokenExpiresAt: newTokenGroup.userRefreshToken.expiresAt,
//     }
//   }

//   async logout(refreshToken: string): Promise<void> {
//     const existingUserRefreshToken =
//       await this.userRefreshTokenRepository.findOneNonExpiredById(refreshToken)

//     if (!existingUserRefreshToken) {
//       // It is fine to not find a refresh token when logging out, the controller should still attempt to destroy the cookie
//       return
//     }

//     await this.userRefreshTokenRepository.destroy(existingUserRefreshToken)
//   }

//   async redeemInviteWithEmailAndPassword(
//     inviteCode: string,
//     email: string,
//     password: string
//   ): Promise<AuthTokenPayload> {
//     const invite = await this.inviteRepository.findOneNonExpiredById(inviteCode)

//     if (!invite) {
//       throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
//     }

//     const user = await this.userRepository.findByEmail(email)

//     if (user) {
//       throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
//     }

//     const encryptedPassword = await bycrypt.hash(password, 13)

//     const newUser = User.createWithEmailAndPassword(email, encryptedPassword)

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
