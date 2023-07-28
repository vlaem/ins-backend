import Logger from './logger'
import { Config } from '@config'
import { createConsoleTransport } from './transports'

const consoleTransport = createConsoleTransport({
  level: Config.Logger.Console.Level,
  silent: Config.Logger.Console.Silent,
})

const logger = new Logger([consoleTransport])

export default logger
