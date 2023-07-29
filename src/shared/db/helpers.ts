import { DateTime } from 'luxon'

export function generateDateTimeGetter(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any): DateTime {
    return DateTime.fromJSDate(this.getDataValue(name))
  }
}
