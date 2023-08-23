import { User as UserModel } from '~dbmodels/auth'
import { User } from '~/modules/auth/domain/models'
import { fromTask, fromNullable, flatMap, map } from 'fp-ts/TaskOption'
import * as T from 'fp-ts/Task'
import { pipe, flow } from 'fp-ts/function'

const userToPersistence = (user: User) => ({
  id: user.id,
  email: user.email,
  password: user.password,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

type UserPersistence = ReturnType<typeof userToPersistence>

export function saveUser(user: User) {
  const save = (x: UserPersistence) => () => UserModel.upsert(x)

  return pipe(
    user,
    userToPersistence,
    save,
    T.map(() => user)
  )
}

export function findUserByEmail(email: string) {
  const getUser = (x: string) => () =>
    UserModel.findOne({ where: { email: x } })

  return pipe(email, getUser, fromTask, flatMap(fromNullable), map(User.load))
}

export function findUserById(id: string) {
  const getUser = (x: string) => () => UserModel.findByPk(x)

  return pipe(id, getUser, fromTask, flatMap(fromNullable), map(User.load))
}

/*
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
*/
