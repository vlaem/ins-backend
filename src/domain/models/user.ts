import { DateTime } from 'luxon'

export type User = {
  id: string
  email: string
  createdAt: DateTime
  updatedAt: DateTime
}
