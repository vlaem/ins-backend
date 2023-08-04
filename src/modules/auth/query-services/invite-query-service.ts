import { InviteRepository } from 'src/modules/auth/infra/repositories'
import { ResourceNotFoundError } from 'src/shared/errors'

interface InviteView {
  id: string
}

export async function getInvite(inviteCode: string): Promise<InviteView> {
  const invite = await InviteRepository.findOneNonExpiredById(inviteCode)

  if (!invite) {
    throw new ResourceNotFoundError('INVITE_NOT_FOUND_OR_EXPIRED')
  }

  return {
    id: invite.id,
  }
}
