import jwt from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { Config } from 'src/shared/config'

export interface JwtPayload {
  id: string
  email: string
}

export class JwtHelper {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  encode(input: JwtPayload) {
    const now = DateTime.now()
    const iat = Math.trunc(now.toSeconds())
    const expiresAt = now.plus(this.config.JWT.duration)
    const exp = Math.trunc(expiresAt.toSeconds())

    const payload = {
      id: input.id,
      email: input.email,
      iat,
      exp,
    }

    const token = jwt.sign(payload, this.config.JWT.secret)
    return {
      accessToken: token,
      accessTokenExpiresAt: expiresAt,
    }
  }

  decode(token: string): JwtPayload {
    const payload = jwt.verify(token, this.config.JWT.secret) as JwtPayload
    return payload
  }
}
