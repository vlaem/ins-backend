import {
  userRepository,
  userRefreshTokenRepository,
} from 'src/modules/auth/infra/repositories'
import bycrypt from 'bcryptjs'
import { DateTime } from 'luxon'
import { encode } from 'src/shared/jwt'
import { sequelize } from '@db'
import { UserRefreshToken } from 'src/modules/auth/domain/models'

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
    throw new Error()
  }

  const isValidPassword = await bycrypt.compare(password, user.password)

  if (!isValidPassword) {
    throw new Error()
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
    throw new Error()
  }

  const user = await userRepository.findByPk(existingUserRefreshToken.userId)

  if (!user) {
    throw new Error()
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

export default {
  passwordLogin,
  refresh,
}
