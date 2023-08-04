import { DateTime } from 'luxon'

export function generateDateTimeGetter(name: string) {
  return function (this: any): DateTime {
    return DateTime.fromJSDate(this.getDataValue(name))
  }
}
