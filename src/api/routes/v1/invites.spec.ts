jest.mock('src/shared/db')

import InvitesRoute from './invites'
import { RegisterService } from 'src/modules/auth'

jest.mock('src/modules/auth')
const mockedRegisterService = RegisterService as jest.Mocked<
  typeof RegisterService
>

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
      expect(mockedRegisterService.redeemLinkInvite).toBeCalledWith(
        'unique-code',
        'email@test.io',
        'unique-password'
      )
    })
  })
})
