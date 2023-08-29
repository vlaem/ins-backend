import { sequelize } from '~db/sq'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { logger } from '~logger'
import { ExtendedHonoError, SystemError } from '~errors'

export const transaction = (
  tasks: Array<T.Task<any>>
): TE.TaskEither<ExtendedHonoError, any> =>
  TE.tryCatch(
    () => sequelize.transaction(() => pipe(tasks, T.sequenceArray)()),
    (e: any) => {
      logger.error(e)
      return SystemError.of(e.message)
    }
  )
