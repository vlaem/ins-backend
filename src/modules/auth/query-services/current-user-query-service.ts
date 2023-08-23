import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import { findeUserByEmail } from '~/modules/auth/infra/repositories/user-repository'

interface CurrentUserView {
  id: string
  email: string
}

export class CurrentUserQueryService {
  private userRepository: UserRepository
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  getCurrentUser(userId: string): T.Task<O.Option<CurrentUserView>> {    
    const getUser = (id: string) => () => this.userRepository.findByPk(id)

    const s =  pipe(
      userId,
      getUser,
      T.map(O.fromNullable),
      T.map(
        O.map((x) => ({
          id: x.id,
          email: x.email,
        }))
      )
    )

    return s
  }
}
