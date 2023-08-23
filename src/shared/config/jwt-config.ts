import { Duration } from 'luxon'

export function getSecret() {
  return process.env.JWT_SECRET as string
}

export function getDuration() {
  return Duration.fromObject({ minutes: 15 })
}
