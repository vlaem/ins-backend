import InvitesRoute from './invites'
import { AuthService } from 'src/modules/auth'

jest.mock('src/modules/auth')
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('InvitesRoute', () => {
  describe('redeemInviteCodeEmailPassword', () => {
    it('should return 200', async () => {
      const response = await InvitesRoute.request(
        '/unique-code/redeem-email-password',
        {
          method: 'PATCH',
          body: JSON.stringify({
            email: 'email@test.io',
            password: 'unique-password',
          }),
        }
      )

      expect(response.status).toBe(200)
      expect(mockedAuthService.redeemInviteWithEmailAndPassword).toBeCalledWith(
        'unique-code',
        'email@test.io',
        'unique-password'
      )
    })
  })
  describe('redeemInviteCodeFirebase', () => {
    it('should return 200', async () => {
      mockedAuthService.redeemInvitaWithFirebaseToken.mockResolvedValueOnce({
        accessToken: 'unique-access-token',
        refreshToken: 'unique-refresh-token',
      })

      const response = await InvitesRoute.request(
        '/unique-code/redeem-firebase',
        {
          method: 'PATCH',
          body: JSON.stringify({
            firebaseToken: 'unique-firebase-token',
          }),
        }
      )

      expect(response.headers.get('Set-Cookie')).toBe(
        'refreshToken=unique-refresh-token; HttpOnly; Path=/;'
      )
      expect(response.status).toBe(200)
      expect(mockedAuthService.redeemInvitaWithFirebaseToken).toBeCalledWith(
        'unique-code',
        'unique-firebase-token'
      )
    })
  })
})
