import { User } from 'src/modules/auth/domain/models'
import bycrypt from 'bcryptjs'
import {
  linkInviteRepository,
  userRepository,
} from 'src/modules/auth/infra/repositories'
import { sequelize } from '@db'

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

  const encryptedPassword = await bycrypt.hash(password, 13)

  const newUser = User.create(email, encryptedPassword)

  await sequelize.transaction(async () => {
    await userRepository.add(newUser)
    await linkInviteRepository.destroy(invite)
  })
}

export default {
  redeemLinkInvite,
}
