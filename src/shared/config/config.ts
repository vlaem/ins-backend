import { Duration } from 'luxon'

class JWTConfig {
  get secret(): string {
    return process.env.JWT_SECRET as string
  }
  get duration(): Duration {
    return Duration.fromObject({ minutes: 15 })
  }
}

class DatabaseConfig {
  get url(): string {
    return process.env.DATABASE_URL as string
  }
}

class ServerConfig {
  get port(): number {
    return Number.parseInt(process.env.PORT || '3000')
  }
}

class ConsoleLoggerConfig {
  get level(): string {
    return process.env.LOGGER_CONSOLE_LEVEL || 'info'
  }
  get silent(): boolean {
    return process.env.LOGGER_CONSOLE_SILENT === 'true'
  }
}

class LoggerConfig {
  get Console(): ConsoleLoggerConfig {
    return new ConsoleLoggerConfig()
  }
}

class FirebaseConfig {
  get projectId(): string {
    return process.env.FIREBASE_PROJECT_ID as string
  }
  get clientEmail(): string {
    return process.env.FIREBASE_CLIENT_EMAIL as string
  }
  get privateKey(): string {
    return process.env.FIREBASE_PRIVATE_KEY as string
  }
  get apiKey(): string {
    return process.env.FIREBASE_API_KEY as string
  }
  get authDomain(): string {
    return process.env.FIREBASE_AUTH_DOMAIN as string
  }
}

export class Config {
  get AppEnv(): string {
    return process.env.APP_ENV || 'localhost'
  }

  get JWT() {
    return new JWTConfig()
  }

  get Database() {
    return new DatabaseConfig()
  }

  get Server() {
    return new ServerConfig()
  }

  get Logger() {
    return new LoggerConfig()
  }

  get Firebase() {
    return new FirebaseConfig()
  }
}
