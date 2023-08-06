import { Sequelize } from '@sequelize/core'
import bycrypt from 'bcryptjs'
import { DateTime } from 'luxon'
import {
  JwtHelper,
  FirebaseAdmin,
  InviteRepository,
  UserRepository,
  UserRefreshTokenRepository,
} from 'src/modules/auth/infra'
import { UserRefreshToken, User } from 'src/modules/auth/domain/models'
import { InvalidOperationError, ResourceNotFoundError } from '#errors'

interface AuthTokenPayload {
  accessToken: string
  refreshToken: string
}
interface UserData {
  id: string
  email: string
}
interface UserTokenGroup {
  accessToken: string
  userRefreshToken: UserRefreshToken
}

export class AuthService {
  private firebaseAdmin: FirebaseAdmin
  private inviteRepository: InviteRepository
  private userRefreshTokenRepository: UserRefreshTokenRepository
  private userRepository: UserRepository
  private jwtHelper: JwtHelper
  private sequelize: Sequelize

  constructor(
    firebaseAdmin: FirebaseAdmin,
    inviteRepository: InviteRepository,
    userRefreshTokenRepository: UserRefreshTokenRepository,
    userRepository: UserRepository,
    jwtHelper: JwtHelper,
    sequelize: Sequelize
  ) {
    this.firebaseAdmin = firebaseAdmin
    this.inviteRepository = inviteRepository
    this.userRefreshTokenRepository = userRefreshTokenRepository
    this.userRepository = userRepository
    this.jwtHelper = jwtHelper
    this.sequelize = sequelize
  }

  /**
   * Generate a token and a user refresh token for a given user.
   * @param userData - user data
   * @returns {UserTokenGroup}
   */
  private generateTokenAndRefresh(userData: UserData): UserTokenGroup {
    const accessToken = this.jwtHelper.encode(userData)
    const userRefreshToken = UserRefreshToken.create(
      userData.id,
      DateTime.now().plus({ days: 30 })
    )

    return {
      accessToken,
      userRefreshToken,
    }
  }

  async firebaseLogin(firebaseToken: string): Promise<AuthTokenPayload> {
    const decodedToken = await this.firebaseAdmin.decodeToken(firebaseToken)

    const user = await this.userRepository.findByEmail(decodedToken.email)

    if (!user) {
      throw new ResourceNotFoundError('USER_NOT_FOUND')
    }

    const tokenGroup = this.generateTokenAndRefresh({
      id: user.id,
      email: user.email,
    })

    await this.userRefreshTokenRepository.add(tokenGroup.userRefreshToken)

    return {
      accessToken: tokenGroup.accessToken,
      refreshToken: tokenGroup.userRefreshToken.id,
    }
  }

  /**
   * Authenticate user with email and password, returning a token and a refresh token.
   * @param email - user email
   * @param password - user password
   * @returns {Promise<AuthTokenPayload>}
   */
  async passwordLogin(
    email: string,
    password: string
  ): Promise<AuthTokenPayload> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidOperationError('INVALID_USEREMAIL_OR_PASSWORD')
    }

    const isValidPassword = await bycrypt.compare(password, user.password)

    if (!isValidPassword) {
      throw new InvalidOperationError('INVALID_USEREMAIL_OR_PASSWORD')
    }

    const tokenGroup = this.generateTokenAndRefresh({
      id: user.id,
      email: user.email,
    })

    await this.userRefreshTokenRepository.update(tokenGroup.userRefreshToken)

    return {
      accessToken: tokenGroup.accessToken,
      refreshToken: tokenGroup.userRefreshToken.id,
    }
  }

  /**
   * Generate a new token and refresh token from a previous non expired refresh token.
   * It will destroy the previous refresh token.
   * @param refreshToken - refresh token
   * @returns
   */
  async refresh(refreshToken: string): Promise<AuthTokenPayload> {
    const existingUserRefreshToken =
      await this.userRefreshTokenRepository.findOneNonExpiredById(refreshToken)

    if (!existingUserRefreshToken) {
      throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
    }

    const user = await this.userRepository.findByPk(
      existingUserRefreshToken.userId
    )

    if (!user) {
      throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
    }

    const newTokenGroup = this.generateTokenAndRefresh({
      id: user.id,
      email: user.email,
    })

    await this.sequelize.transaction(async () => {
      await this.userRefreshTokenRepository.destroy(existingUserRefreshToken)
      await this.userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
    })

    return {
      accessToken: newTokenGroup.accessToken,
      refreshToken: newTokenGroup.userRefreshToken.id,
    }
  }

  async logout(refreshToken: string): Promise<void> {
    const existingUserRefreshToken =
      await this.userRefreshTokenRepository.findOneNonExpiredById(refreshToken)

    if (!existingUserRefreshToken) {
      // It is fine to not find a refresh token when logging out, the controller should still attempt to destroy the cookie
      return
    }

    await this.userRefreshTokenRepository.destroy(existingUserRefreshToken)
  }

  async redeemInviteWithEmailAndPassword(
    inviteCode: string,
    email: string,
    password: string
  ): Promise<AuthTokenPayload> {
    const invite = await this.inviteRepository.findOneNonExpiredById(inviteCode)

    if (!invite) {
      throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
    }

    const user = await this.userRepository.findByEmail(email)

    if (user) {
      throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
    }

    const encryptedPassword = await bycrypt.hash(password, 13)

    const newUser = User.createWithEmailAndPassword(email, encryptedPassword)

    const newTokenGroup = this.generateTokenAndRefresh({
      id: newUser.id,
      email: newUser.email,
    })

    await this.sequelize.transaction(async () => {
      await this.userRepository.add(newUser)
      await this.inviteRepository.destroy(invite)
      await this.userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
    })

    return {
      accessToken: newTokenGroup.accessToken,
      refreshToken: newTokenGroup.userRefreshToken.id,
    }
  }

  async redeemInvitaWithFirebaseToken(
    inviteCode: string,
    firebaseToken: string
  ): Promise<AuthTokenPayload> {
    const invite = await this.inviteRepository.findOneNonExpiredById(inviteCode)

    if (!invite) {
      throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
    }

    const decodedToken = await this.firebaseAdmin.decodeToken(firebaseToken)

    const user = await this.userRepository.findByEmail(decodedToken.email)

    if (user) {
      throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
    }

    const newUser = User.createWithFirebaseUid(
      decodedToken.email,
      decodedToken.uid
    )

    const newTokenGroup = this.generateTokenAndRefresh({
      id: newUser.id,
      email: newUser.email,
    })

    await this.sequelize.transaction(async () => {
      await this.userRepository.add(newUser)
      await this.inviteRepository.destroy(invite)
      await this.userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
    })

    return {
      accessToken: newTokenGroup.accessToken,
      refreshToken: newTokenGroup.userRefreshToken.id,
    }
  }
}
