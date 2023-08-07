import { AuthService } from 'src/modules/auth'
import {
  JwtHelper,
  FirebaseAdmin,
  InviteRepository,
  UserRepository,
  UserRefreshTokenRepository,
} from 'src/modules/auth/infra'
import { Sequelize } from '@sequelize/core'
import { UserRefreshToken, User, Invite } from 'src/modules/auth/domain/models'
import { InvalidOperationError } from '#errors'
import { mock } from 'jest-mock-extended'
import { Logger } from '#logger'
import { DateTime } from 'luxon'

jest.mock('src/modules/auth/domain/models')
const mockedUser = User as jest.Mocked<typeof User>
const mockedUserRefreshToken = UserRefreshToken as jest.Mocked<
  typeof UserRefreshToken
>
const mockedInvite = Invite as jest.Mocked<typeof Invite>

describe('authService', () => {
  let authService: AuthService

  let mockedInviteRepository: ReturnType<typeof mock<InviteRepository>>
  let mockedUserRepository: ReturnType<typeof mock<UserRepository>>
  let mockedUserRefreshTokenRepository: ReturnType<
    typeof mock<UserRefreshTokenRepository>
  >
  let mockedJwtHelper: ReturnType<typeof mock<JwtHelper>>
  let mockedFirebaseAdmin: ReturnType<typeof mock<FirebaseAdmin>>
  let mockedSequelize: ReturnType<typeof mock<Sequelize>>
  let mockedLogger: ReturnType<typeof mock<Logger>>

  beforeEach(() => {
    mockedInviteRepository = mock<InviteRepository>()
    mockedUserRepository = mock<UserRepository>()
    mockedUserRefreshTokenRepository = mock<UserRefreshTokenRepository>()
    mockedJwtHelper = mock<JwtHelper>()
    mockedFirebaseAdmin = mock<FirebaseAdmin>()
    mockedSequelize = mock<Sequelize>()
    mockedLogger = mock<Logger>()

    authService = new AuthService(
      mockedFirebaseAdmin,
      mockedInviteRepository,
      mockedUserRefreshTokenRepository,
      mockedUserRepository,
      mockedJwtHelper,
      mockedSequelize,
      mockedLogger
    )
  })

  describe('firebaseLogin', () => {
    it('should throw an InvalidOperationError if the email is not found', async () => {
      mockedFirebaseAdmin.decodeToken.mockResolvedValueOnce({
        uid: 'unique-firebase-token',
        email: 'email@test.io',
      })
      mockedUserRepository.findByEmail.mockResolvedValueOnce(null)

      await expect(
        authService.firebaseLogin('unique-firebase-token')
      ).rejects.toThrowError(new InvalidOperationError('USER_NOT_FOUND'))
    })
    it('should return a token and a refresh token', async () => {
      mockedFirebaseAdmin.decodeToken.mockResolvedValueOnce({
        uid: 'unique-firebase-token',
        email: 'email@test.io',
      })

      const user = new (mockedUser as any).constructor()
      mockedUserRepository.findByEmail.mockResolvedValueOnce(user)

      mockedJwtHelper.encode.mockReturnValueOnce({
        accessToken: 'unique-access-token',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })

      const newUserRefreshToken = new (
        mockedUserRefreshToken as any
      ).constructor()
      newUserRefreshToken.id = 'unique-refresh-token-id'
      mockedUserRefreshToken.create.mockReturnValueOnce(newUserRefreshToken)

      const result = await authService.firebaseLogin('unique-firebase-token')

      expect(mockedUserRefreshTokenRepository.add).toHaveBeenCalledWith(
        newUserRefreshToken
      )

      expect(result).toEqual({
        accessToken: 'unique-access-token',
        refreshToken: 'unique-refresh-token-id',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })
    })
  })
  describe('refresh', () => {
    it('should throw an InvalidOperationError if the refresh token is not found', async () => {
      mockedUserRefreshTokenRepository.findOneNonExpiredById.mockResolvedValueOnce(
        null
      )

      await expect(
        authService.refresh('unique-refresh-token')
      ).rejects.toThrowError(new InvalidOperationError('INVALID_REFRESH_TOKEN'))
    })
    it('should throw an InvalidOperationError if the user is not found', async () => {
      const refreshToken = new (mockedUserRefreshToken as any).constructor()
      mockedUserRefreshTokenRepository.findOneNonExpiredById.mockResolvedValueOnce(
        refreshToken
      )

      mockedUserRepository.findByPk.mockResolvedValueOnce(null)

      await expect(
        authService.refresh('unique-refresh-token')
      ).rejects.toThrowError(new InvalidOperationError('INVALID_REFRESH_TOKEN'))
    })
    it('should return a token and a refresh token', async () => {
      const refreshToken = new (mockedUserRefreshToken as any).constructor()
      mockedUserRefreshTokenRepository.findOneNonExpiredById.mockResolvedValueOnce(
        refreshToken
      )

      const user = new (mockedUser as any).constructor()
      mockedUserRepository.findByPk.mockResolvedValueOnce(user)

      mockedJwtHelper.encode.mockReturnValueOnce({
        accessToken: 'unique-access-token',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })

      const newUserRefreshToken = new (
        mockedUserRefreshToken as any
      ).constructor()
      newUserRefreshToken.id = 'unique-refresh-token-id'
      mockedUserRefreshToken.create.mockReturnValueOnce(newUserRefreshToken)

      mockedSequelize.transaction.mockImplementation((callback: any) =>
        callback()
      )

      const result = await authService.refresh('unique-refresh-token')

      expect(mockedUserRefreshTokenRepository.add).toHaveBeenCalledWith(
        newUserRefreshToken
      )
      expect(mockedUserRefreshTokenRepository.destroy).toHaveBeenCalledWith(
        refreshToken
      )
      expect(result).toEqual({
        accessToken: 'unique-access-token',
        refreshToken: 'unique-refresh-token-id',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })
    })
  })
  describe('logout', () => {
    it('should return early if the refresh token is not found', async () => {
      mockedUserRefreshTokenRepository.findOneNonExpiredById.mockResolvedValueOnce(
        null
      )

      await authService.logout('unique-refresh-token')
      expect(mockedUserRefreshTokenRepository.destroy).not.toHaveBeenCalled()
    })
    it('should destroy the refresh token', async () => {
      const refreshToken = new (mockedUserRefreshToken as any).constructor()
      mockedUserRefreshTokenRepository.findOneNonExpiredById.mockResolvedValueOnce(
        refreshToken
      )

      await authService.logout('unique-refresh-token')

      expect(mockedUserRefreshTokenRepository.destroy).toHaveBeenCalledWith(
        refreshToken
      )
    })
  })
  describe('redeemInvitaWithFirebaseToken', () => {
    it('should throw an InvalidOperationError if the invite code is not found or expired', async () => {
      mockedInviteRepository.findOneNonExpiredById.mockResolvedValueOnce(null)

      await expect(
        authService.redeemInvitaWithFirebaseToken(
          'unique-code',
          'unique-firebase-token'
        )
      ).rejects.toThrowError(new InvalidOperationError('LINK_INVITE_NOT_FOUND'))
    })
    it('should throw an InvalidOperationError if the email is already in use', async () => {
      const existinInvite = new (mockedInvite as any).constructor()
      mockedInviteRepository.findOneNonExpiredById.mockResolvedValueOnce(
        existinInvite
      )

      const existingUser = new (mockedUser as any).constructor()
      mockedUserRepository.findByEmail.mockResolvedValueOnce(existingUser)

      mockedFirebaseAdmin.decodeToken.mockResolvedValueOnce({
        uid: 'unique-firebase-token',
        email: 'existing-email@test.io',
      })

      await expect(
        authService.redeemInvitaWithFirebaseToken(
          'unique-code',
          'unique-firebase-token'
        )
      ).rejects.toThrowError(new InvalidOperationError('EMAIL_ALREADY_IN_USE'))
    })
    it('should generate a new user and return a token and a refresh token', async () => {
      const existinInvite = new (mockedInvite as any).constructor()
      mockedInviteRepository.findOneNonExpiredById.mockResolvedValueOnce(
        existinInvite
      )

      mockedUserRepository.findByEmail.mockResolvedValueOnce(null)

      mockedFirebaseAdmin.decodeToken.mockResolvedValueOnce({
        uid: 'firebase-uid',
        email: 'new-email@test.io',
      })

      const newUser = new (mockedUser as any).constructor()
      newUser.id = 'unique-user-id'
      newUser.email = 'new-email@test.io'
      newUser.firebaseUid = 'firebase-uid'

      mockedUser.createWithFirebaseUid.mockReturnValueOnce(newUser)
      mockedJwtHelper.encode.mockReturnValueOnce({
        accessToken: 'unique-access-token',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })

      const newUserRefreshToken = new (
        mockedUserRefreshToken as any
      ).constructor()
      newUserRefreshToken.id = 'unique-refresh-token-id'
      mockedUserRefreshToken.create.mockReturnValueOnce(newUserRefreshToken)

      mockedSequelize.transaction.mockImplementation((callback: any) =>
        callback()
      )

      const result = await authService.redeemInvitaWithFirebaseToken(
        'unique-code',
        'unique-firebase-token'
      )

      expect(mockedSequelize.transaction).toHaveBeenCalledTimes(1)

      expect(mockedUserRepository.add).toHaveBeenCalledWith(newUser)
      expect(mockedInviteRepository.destroy).toHaveBeenCalledWith(existinInvite)
      expect(mockedUserRefreshTokenRepository.add).toHaveBeenCalledWith(
        newUserRefreshToken
      )

      expect(result).toEqual({
        accessToken: 'unique-access-token',
        refreshToken: 'unique-refresh-token-id',
        accessTokenExpiresAt: DateTime.fromISO('2021-01-01'),
      })
    })
  })
})
