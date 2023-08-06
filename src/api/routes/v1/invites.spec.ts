import { createInviteRoute } from './invites'
import { AuthService, InviteQueryService } from 'src/modules/auth'
import { mock } from 'jest-mock-extended'

describe('InvitesRoute', () => {
  let InvitesRoute: ReturnType<typeof createInviteRoute>
  let mockedAuthService: ReturnType<typeof mock<AuthService>>
  let mockedInviteQueryService: ReturnType<typeof mock<InviteQueryService>>

  beforeEach(() => {
    mockedAuthService = mock<AuthService>()
    mockedInviteQueryService = mock<InviteQueryService>()

    InvitesRoute = createInviteRoute(
      mockedAuthService,
      mockedInviteQueryService
    )
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
        'refresh_token=unique-refresh-token; HttpOnly'
      )

      expect(response.status).toBe(200)
      expect(mockedAuthService.redeemInvitaWithFirebaseToken).toBeCalledWith(
        'unique-code',
        'unique-firebase-token'
      )
    })
  })
})
