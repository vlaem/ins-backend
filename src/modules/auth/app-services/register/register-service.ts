import { User } from 'src/modules/auth/domain/models'
import {
  linkInviteRepository,
  userRepository,
  sequelize,
} from 'src/modules/auth/infra/repositories'

export const redeemLinkInvite = async (
  linkInviteCode: string,
  email: string,
  password: string
) => {
  const invite = await linkInviteRepository.findOneNonExpiredById(
    linkInviteCode
  )

  if (!invite) {
    throw new Error()
  }

  const user = await userRepository.findByEmail(email)

  if (user) {
    throw new Error()
  }

  const newUser = User.create(email, password)

  await sequelize.transaction(async () => {
    await userRepository.add(newUser)
    await linkInviteRepository.destroy(invite)
  })
}

export default {
  redeemLinkInvite,
}
