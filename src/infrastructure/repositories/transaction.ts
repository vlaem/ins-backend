import { sequelize } from '~db/sq'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { ExtendedHonoError, SystemError } from '~errors'

export const transaction = <A>(
  f: T.Task<A>
): TE.TaskEither<ExtendedHonoError, any> =>
  TE.tryCatch(
    () => sequelize.transaction(f),
    () => SystemError.of('TRANSACTION_ERROR')
  )
