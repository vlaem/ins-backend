import { DateTime } from 'luxon'

export type Invite = {
  id: string
  expiresAt: DateTime
  createdAt: DateTime
}
