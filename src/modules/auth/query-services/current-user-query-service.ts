import { UserRepository } from 'src/modules/auth/infra/repositories'
import { ResourceNotFoundError } from 'src/shared/errors'

interface CurrentUserView {
  id: string
  email: string
}

export async function getCurrentUser(userId: string): Promise<CurrentUserView> {
  const user = await UserRepository.findByPk(userId)

  if (!user) {
    throw new ResourceNotFoundError('USER_NOT_FOUND')
  }

  return {
    id: user.id,
    email: user.email,
  }
}
