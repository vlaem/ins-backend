import { Duration } from 'luxon'

export class Config {
  static get AppEnv(): string {
    return process.env.APP_ENV || 'localhost'
  }

  static JWT = class {
    static get secret(): string {
      return process.env.JWT_SECRET as string
    }
    static get duration(): Duration {
      return Duration.fromObject({ minutes: 15 })
    }
  }

  static Database = class {
    static get Url() {
      return process.env.DATABASE_URL as string
    }
  }

  static Web = class {
    static get Port() {
      return Number.parseInt(process.env.PORT || '3000')
    }
  }

  static Logger = class {
    static Console = class {
      static get Level(): string {
        return process.env.LOGGER_CONSOLE_LEVEL || 'info'
      }
      static get Silent(): boolean {
        return process.env.LOGGER_CONSOLE_SILENT === 'true'
      }
    }
  }
}
