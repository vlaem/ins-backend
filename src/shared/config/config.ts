export class Config {
  static get AppEnv(): string {
    return process.env.APP_ENV || 'localhost'
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
