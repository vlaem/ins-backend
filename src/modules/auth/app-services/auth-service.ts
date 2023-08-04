import {
  InviteRepository,
  UserRepository,
  UserRefreshTokenRepository,
} from 'src/modules/auth/infra/repositories'
import bycrypt from 'bcryptjs'
import { DateTime } from 'luxon'
import { encode } from 'src/shared/jwt'
import { sequelize } from '@db'
import { UserRefreshToken, User } from 'src/modules/auth/domain/models'
import { InvalidOperationError, ResourceNotFoundError } from '#errors'
import { FirebaseAdmin } from 'src/modules/auth/infra/firebase'

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

/**
 * Generate a token and a user refresh token for a given user.
 * @param userData - user data
 * @returns {UserTokenGroup}
 */
function generateTokenAndRefresh(userData: UserData): UserTokenGroup {
  const accessToken = encode(userData)
  const userRefreshToken = UserRefreshToken.create(
    userData.id,
    DateTime.now().plus({ days: 30 })
  )

  return {
    accessToken,
    userRefreshToken,
  }
}

export async function firebaseLogin(
  firebaseToken: string
): Promise<AuthTokenPayload> {
  const decodedToken = await FirebaseAdmin.decodeToken(firebaseToken)

  const user = await UserRepository.findByEmail(decodedToken.email)

  if (!user) {
    throw new ResourceNotFoundError('USER_NOT_FOUND')
  }

  const tokenGroup = generateTokenAndRefresh({
    id: user.id,
    email: user.email,
  })

  await UserRefreshTokenRepository.add(tokenGroup.userRefreshToken)

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
export async function passwordLogin(
  email: string,
  password: string
): Promise<AuthTokenPayload> {
  const user = await UserRepository.findByEmail(email)

  if (!user) {
    throw new InvalidOperationError('INVALID_USEREMAIL_OR_PASSWORD')
  }

  const isValidPassword = await bycrypt.compare(password, user.password)

  if (!isValidPassword) {
    throw new InvalidOperationError('INVALID_USEREMAIL_OR_PASSWORD')
  }

  const tokenGroup = generateTokenAndRefresh({
    id: user.id,
    email: user.email,
  })

  await UserRefreshTokenRepository.update(tokenGroup.userRefreshToken)

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
export async function refresh(refreshToken: string): Promise<AuthTokenPayload> {
  const existingUserRefreshToken =
    await UserRefreshTokenRepository.findOneNonExpiredById(refreshToken)

  if (!existingUserRefreshToken) {
    throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
  }

  const user = await UserRepository.findByPk(existingUserRefreshToken.userId)

  if (!user) {
    throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
  }

  const newTokenGroup = generateTokenAndRefresh({
    id: user.id,
    email: user.email,
  })

  await sequelize.transaction(async () => {
    await UserRefreshTokenRepository.destroy(existingUserRefreshToken)
    await UserRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
  })

  return {
    accessToken: newTokenGroup.accessToken,
    refreshToken: newTokenGroup.userRefreshToken.id,
  }
}

export async function logout(refreshToken: string): Promise<void> {
  const existingUserRefreshToken =
    await UserRefreshTokenRepository.findOneNonExpiredById(refreshToken)

  if (!existingUserRefreshToken) {
    // It is fine to not find a refresh token when logging out, the controller should still attempt to destroy the cookie
    return
  }

  await UserRefreshTokenRepository.destroy(existingUserRefreshToken)
}

export async function redeemInviteWithEmailAndPassword(
  inviteCode: string,
  email: string,
  password: string
): Promise<AuthTokenPayload> {
  const invite = await InviteRepository.findOneNonExpiredById(inviteCode)

  if (!invite) {
    throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
  }

  const user = await UserRepository.findByEmail(email)

  if (user) {
    throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
  }

  const encryptedPassword = await bycrypt.hash(password, 13)

  const newUser = User.createWithEmailAndPassword(email, encryptedPassword)

  const newTokenGroup = generateTokenAndRefresh({
    id: newUser.id,
    email: newUser.email,
  })

  await sequelize.transaction(async () => {
    await UserRepository.add(newUser)
    await InviteRepository.destroy(invite)
    await UserRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
  })

  return {
    accessToken: newTokenGroup.accessToken,
    refreshToken: newTokenGroup.userRefreshToken.id,
  }
}

export async function redeemInvitaWithFirebaseToken(
  inviteCode: string,
  firebaseToken: string
): Promise<AuthTokenPayload> {
  const invite = await InviteRepository.findOneNonExpiredById(inviteCode)

  if (!invite) {
    throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
  }

  const decodedToken = await FirebaseAdmin.decodeToken(firebaseToken)

  const user = await UserRepository.findByEmail(decodedToken.email)

  if (user) {
    throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
  }

  const newUser = User.createWithFirebaseUid(
    decodedToken.email,
    decodedToken.uid
  )

  const newTokenGroup = generateTokenAndRefresh({
    id: newUser.id,
    email: newUser.email,
  })

  await sequelize.transaction(async () => {
    await UserRepository.add(newUser)
    await InviteRepository.destroy(invite)
    await UserRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
  })

  return {
    accessToken: newTokenGroup.accessToken,
    refreshToken: newTokenGroup.userRefreshToken.id,
  }
}
