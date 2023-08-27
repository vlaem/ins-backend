import { DateTime } from 'luxon'
import { User as UserModel } from '~dbmodels/auth'
import { User } from '~domain/models/user'
import * as TO from 'fp-ts/TaskOption'
import * as T from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'

export interface UserModelLike {
  id: string
  email: string
  createdAt: DateTime
  updatedAt: DateTime
}

const modelToDomain = (x: UserModel): User => ({
  id: x.id,
  email: x.email,
  createdAt: x.createdAt,
  updatedAt: x.updatedAt,
})

const domainToModel = (x: User): UserModelLike => ({
  id: x.id,
  email: x.email,
  createdAt: x.createdAt,
  updatedAt: x.updatedAt,
})

export function save(user: User) {
  const save = (x: UserModelLike) => () => UserModel.upsert(x)

  return pipe(
    user,
    domainToModel,
    save,
    T.map(() => user)
  )
}

export function findByEmail(email: string) {
  const getUser = (x: string) => () =>
    UserModel.findOne({ where: { email: x } })

  return pipe(
    email,
    getUser,
    TO.fromTask,
    TO.flatMap(TO.fromNullable),
    TO.map(modelToDomain)
  )
}

export function findById(id: string) {
  const getUser = (x: string) => () => UserModel.findByPk(x)

  return pipe(
    id,
    getUser,
    TO.fromTask,
    TO.flatMap(TO.fromNullable),
    TO.map(modelToDomain)
  )
}
