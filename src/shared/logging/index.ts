import { Logger } from './logger'
import { Config } from '~config'
import { createConsoleTransport } from './transports'

export function loggerFactory(config: Config) {
  const consoleTransport = createConsoleTransport({
    level: config.Logger.Console.level,
    silent: config.Logger.Console.silent,
  })

  const transports = [consoleTransport]

  const logger = new Logger(transports)

  return logger
}

export { Logger }
