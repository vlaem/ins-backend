import { User as UserModel } from '~dbmodels/auth'
import { User } from '~/modules/auth/domain/models/user'
import { fromTask, fromNullable, flatMap, map } from 'fp-ts/TaskOption'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'

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
