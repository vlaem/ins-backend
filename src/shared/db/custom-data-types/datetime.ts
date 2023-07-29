import { DataTypes, ValidationErrorItem } from '@sequelize/core'
import assert from 'assert'
import luxon from 'luxon'

export class DateTime extends DataTypes.ABSTRACT<luxon.DateTime> {
  toSql() {
    return 'TIMESTAMP WITH TIME ZONE'
  }

  validate(value: unknown): void {
    if (!(value instanceof luxon.DateTime)) {
      ValidationErrorItem.throwDataTypeValidationError(
        'Value must be a luxon DateTime object'
      )
    }
  }

  sanitize(value: unknown): unknown {
    if (value instanceof Date) {
      return luxon.DateTime.fromJSDate(value)
    }
  }

  parseDatabaseValue(value: unknown): luxon.DateTime {
    assert(
      typeof value === 'string',
      'Expected to receive a string from the database'
    )
    return luxon.DateTime.fromISO(value as string)
  }

  toBindableValue(value: luxon.DateTime): unknown {
    return value.toISO()
  }
}
