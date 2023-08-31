import * as TO from 'fp-ts/TaskOption'
import * as Invites from './invites'
import { DateTime } from 'luxon'
jest.mock('~/infrastructure/repositories/invite-repository')
import * as InviteRepo from '~/infrastructure/repositories/invite-repository'

const mockInviteRepo = InviteRepo as jest.Mocked<typeof InviteRepo>

describe('Invites', () => {
  describe('findValidInvite', () => {
    it('should return an InviteView', async () => {
      mockInviteRepo.findNonExpiredById.mockReturnValueOnce(
        TO.of({
          id: 'inviteId',
          expiresAt: DateTime.now().plus({ days: 1 }),
          createdAt: DateTime.now(),
        })
      )

      const invite = await Invites.findValidInvite('inviteCode')()
      expect(invite).toBeRight()
    })
  })
})
