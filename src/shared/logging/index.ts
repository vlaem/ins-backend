import Logger from './logger'
import { createConsoleTransport } from './transports'

const consoleTransport = createConsoleTransport({
  level: 'info',
})

const logger = new Logger([consoleTransport])

export default logger
