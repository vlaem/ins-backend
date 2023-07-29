import { DataTypes, ValidationErrorItem } from '@sequelize/core'
import assert from 'assert'
import { DateTime as LuxonDateTime } from 'luxon'

export class DateTime extends DataTypes.ABSTRACT<LuxonDateTime> {
  toSql() {
    return 'TIMESTAMP WITH TIME ZONE'
  }

  validate(value: unknown): void {
    if (!(value instanceof LuxonDateTime)) {
      ValidationErrorItem.throwDataTypeValidationError(
        'Value must be a luxon DateTime object'
      )
    }
  }

  sanitize(value: unknown): unknown {
    if (value instanceof Date) {
      return LuxonDateTime.fromJSDate(value)
    }
  }

  parseDatabaseValue(value: unknown): LuxonDateTime {
    assert(
      typeof value === 'string',
      'Expected to receive a string from the database'
    )
    return LuxonDateTime.fromISO(value as string)
  }

  toBindableValue(value: LuxonDateTime): unknown {
    return value.toISO()
  }
}
