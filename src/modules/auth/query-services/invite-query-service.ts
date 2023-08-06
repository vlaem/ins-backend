import { InviteRepository } from 'src/modules/auth/infra/repositories'
import { ResourceNotFoundError } from 'src/shared/errors'

interface InviteView {
  id: string
}

export class InviteQueryService {
  private inviteRepository: InviteRepository
  constructor(inviteRepository: InviteRepository) {
    this.inviteRepository = inviteRepository
  }

  async getInvite(inviteCode: string): Promise<InviteView> {
    const invite = await this.inviteRepository.findOneNonExpiredById(inviteCode)

    if (!invite) {
      throw new ResourceNotFoundError('INVITE_NOT_FOUND_OR_EXPIRED')
    }

    return {
      id: invite.id,
    }
  }
}
