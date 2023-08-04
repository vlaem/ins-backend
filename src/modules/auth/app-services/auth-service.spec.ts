import { AuthService } from 'src/modules/auth'
import {
  InviteRepository,
  UserRepository,
  UserRefreshTokenRepository,
} from 'src/modules/auth/infra/repositories'
import * as JWT from 'src/shared/jwt'
import { sequelize } from '@db'
import { UserRefreshToken, User, Invite } from 'src/modules/auth/domain/models'
import { InvalidOperationError } from '#errors'
import { FirebaseAdmin } from 'src/modules/auth/infra/firebase'

jest.mock('src/modules/auth/infra/repositories')
const mockedInviteRepository = InviteRepository as jest.Mocked<
  typeof InviteRepository
>
const mockedUserRepository = UserRepository as jest.Mocked<
  typeof UserRepository
>
const mockedUserRefreshTokenRepository =
  UserRefreshTokenRepository as jest.Mocked<typeof UserRefreshTokenRepository>

jest.mock('src/modules/auth/domain/models')
const mockedUser = User as jest.Mocked<typeof User>
const mockedUserRefreshToken = UserRefreshToken as jest.Mocked<
  typeof UserRefreshToken
>
const mockedInvite = Invite as jest.Mocked<typeof Invite>

jest.mock('src/modules/auth/infra/firebase')
const mockedFirebaseAdmin = FirebaseAdmin as jest.Mocked<typeof FirebaseAdmin>

jest.mock('src/shared/jwt')
const mockedJWT = JWT as jest.Mocked<typeof JWT>

jest.mock('src/shared/jwt')
const mockedSequelize = sequelize as jest.Mocked<typeof sequelize>

describe('AuthService', () => {
  describe('redeemInvitaWithFirebaseToken', () => {
    it('should throw an InvalidOperationError if the invite code is not found or expired', async () => {
      mockedInviteRepository.findOneNonExpiredById.mockResolvedValueOnce(null)

      await expect(
        AuthService.redeemInvitaWithFirebaseToken(
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
        AuthService.redeemInvitaWithFirebaseToken(
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
      mockedJWT.encode.mockReturnValueOnce('unique-access-token')

      const newUserRefreshToken = new (
        mockedUserRefreshToken as any
      ).constructor()
      newUserRefreshToken.id = 'unique-refresh-token-id'
      mockedUserRefreshToken.create.mockReturnValueOnce(newUserRefreshToken)

      mockedSequelize.transaction.mockImplementation((callback: any) =>
        callback()
      )

      const result = await AuthService.redeemInvitaWithFirebaseToken(
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
      })
    })
  })
})
