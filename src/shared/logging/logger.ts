import winston from 'winston'

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

export class Logger {
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

  public emerg(message: string, ...meta: any[]) {
    this.winstonLogger.emerg(message, ...meta)
  }

  public alert(message: string, ...meta: any[]) {
    this.winstonLogger.alert(message, ...meta)
  }

  public crit(message: string, ...meta: any[]) {
    this.winstonLogger.crit(message, ...meta)
  }

  public error(message: string, ...meta: any[]) {
    this.winstonLogger.error(message, ...meta)
  }

  public warning(message: string, ...meta: any[]) {
    this.winstonLogger.warning(message, ...meta)
  }

  public notice(message: string, ...meta: any[]) {
    this.winstonLogger.notice(message, ...meta)
  }

  public info(message: string, ...meta: any[]) {
    this.winstonLogger.info(message, ...meta)
  }

  public debug(message: string, ...meta: any[]) {
    this.winstonLogger.debug(message, ...meta)
  }
}
