import {
  inviteRepository,
  userRepository,
  userRefreshTokenRepository,
} from 'src/modules/auth/infra/repositories'
import bycrypt from 'bcryptjs'
import { DateTime } from 'luxon'
import { encode } from 'src/shared/jwt'
import { sequelize } from '@db'
import { UserRefreshToken, User } from 'src/modules/auth/domain/models'
import { InvalidOperationError, ResourceNotFoundError } from 'src/shared/errors'

interface AuthTokenPayload {
  token: string
  refreshToken: string
}
interface UserData {
  id: string
  email: string
}
interface UserTokenGroup {
  token: string
  userRefreshToken: UserRefreshToken
}

/**
 * Generate a token and a user refresh token for a given user.
 * @param userData - user data
 * @returns {UserTokenGroup}
 */
export function generateTokenAndRefresh(userData: UserData): UserTokenGroup {
  const token = encode(userData)
  const userRefreshToken = UserRefreshToken.create(
    userData.id,
    DateTime.now().plus({ days: 30 })
  )

  return {
    token,
    userRefreshToken,
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
  const user = await userRepository.findByEmail(email)

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

  await userRefreshTokenRepository.update(tokenGroup.userRefreshToken)

  return {
    token: tokenGroup.token,
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
    await userRefreshTokenRepository.findOneNonExpiredById(refreshToken)

  if (!existingUserRefreshToken) {
    throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
  }

  const user = await userRepository.findByPk(existingUserRefreshToken.userId)

  if (!user) {
    throw new InvalidOperationError('INVALID_REFRESH_TOKEN')
  }

  const newTokenGroup = generateTokenAndRefresh({
    id: user.id,
    email: user.email,
  })

  await sequelize.transaction(async () => {
    await userRefreshTokenRepository.destroy(existingUserRefreshToken)
    await userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
  })

  return {
    token: newTokenGroup.token,
    refreshToken: newTokenGroup.userRefreshToken.id,
  }
}

export async function redeemInvite(
  inviteCode: string,
  email: string,
  password: string
) {
  const invite = await inviteRepository.findOneNonExpiredById(inviteCode)

  if (!invite) {
    throw new ResourceNotFoundError('LINK_INVITE_NOT_FOUND')
  }

  const user = await userRepository.findByEmail(email)

  if (user) {
    throw new InvalidOperationError('EMAIL_ALREADY_IN_USE')
  }

  const encryptedPassword = await bycrypt.hash(password, 13)

  const newUser = User.create(email, encryptedPassword)

  const newTokenGroup = generateTokenAndRefresh({
    id: newUser.id,
    email: newUser.email,
  })

  await sequelize.transaction(async () => {
    await userRepository.add(newUser)
    await inviteRepository.destroy(invite)
    await userRefreshTokenRepository.add(newTokenGroup.userRefreshToken)
  })

  return {
    token: newTokenGroup.token,
    refreshToken: newTokenGroup.userRefreshToken.id,
  }
}

export default {
  passwordLogin,
  refresh,
  redeemInvite,
}
