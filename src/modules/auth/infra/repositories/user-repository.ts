import { User as UserModel } from '~dbmodels/auth'
import { User } from '~/modules/auth/domain/models'
import { FindOptions, InferAttributes } from '@sequelize/core'
import { GenericRepository } from './generic-repository'

export class UserRepository implements GenericRepository<User, UserModel> {
  async findOne(
    options?:
      | FindOptions<InferAttributes<UserModel, { omit: never }>>
      | undefined
  ) {
    const sqUser = await UserModel.findOne(options)

    if (!sqUser) {
      return null
    }

    return User.load(sqUser)
  }

  async add(user: User): Promise<void> {
    await UserModel.create({
      id: user.id,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async update(user: User): Promise<void> {
    await UserModel.update(
      {
        email: user.email,
        password: user.password,
      },
      { where: { id: user.id } }
    )
  }

  async updateAll(users: User[]): Promise<void> {
    for (const user of users) {
      await this.update(user)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } })
  }

  async findByPk(id: string): Promise<User | null> {
    return this.findOne({ where: { id } })
  }
}
