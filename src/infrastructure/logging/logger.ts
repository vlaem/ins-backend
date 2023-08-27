import * as winston from 'winston'
import * as LoggerConfig from '~config/logger-config'
import { createConsoleTransport } from './transports/console'

class Logger {
  protected winstonLogger: winston.Logger

  constructor(
    transports: winston.transport[],
    additionalFormats: winston.Logform.Format[] = []
  ) {
    const formats = [
      winston.format.errors({ stack: true }),
      ...additionalFormats,
    ]

    this.winstonLogger = this.winstonLogger = winston.createLogger({
      format: winston.format.combine.apply(null, formats),
      levels: winston.config.syslog.levels,
    })

    for (const transport of transports) {
      this.winstonLogger.add(transport)
    }
  }

  emerg(message: any): void
  emerg(message: string, ...meta: any[]): void
  emerg(message: any, ...meta: any[]) {
    this.winstonLogger.emerg(message, ...meta)
  }

  alert(message: any): void
  alert(message: string, ...meta: any[]): void
  alert(message: any, ...meta: any[]) {
    this.winstonLogger.alert(message, ...meta)
  }

  crit(message: any): void
  crit(message: string, ...meta: any[]): void
  crit(message: any, ...meta: any[]) {
    this.winstonLogger.crit(message, ...meta)
  }

  error(message: any): void
  error(message: string, ...meta: any[]): void
  error(message: any, ...meta: any[]) {
    this.winstonLogger.error(message, ...meta)
  }

  warning(message: any): void
  warning(message: string, ...meta: any[]): void
  warning(message: any, ...meta: any[]) {
    this.winstonLogger.warning(message, ...meta)
  }

  notice(message: any): void
  notice(message: string, ...meta: any[]): void
  notice(message: any, ...meta: any[]) {
    this.winstonLogger.notice(message, ...meta)
  }

  info(message: any): void
  info(message: string, ...meta: any[]): void
  info(message: any, ...meta: any[]) {
    this.winstonLogger.info(message, ...meta)
  }

  debug(message: any): void
  debug(message: string, ...meta: any[]): void
  debug(message: any, ...meta: any[]) {
    this.winstonLogger.debug(message, ...meta)
  }
}

winston.addColors({
  emerg: 'red',
  alert: 'red',
  crit: 'red',
  error: 'red',
  warning: 'yellow',
  notice: 'magenta',
  info: 'green',
  debug: 'blue',
})

const consoleTransport = createConsoleTransport({
  level: LoggerConfig.getConsoleLevel(),
  silent: LoggerConfig.isConsoleSilent(),
})

const transports = [consoleTransport]

export const logger = new Logger(transports)
