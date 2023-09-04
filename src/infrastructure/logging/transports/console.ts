import stringify from 'safe-stable-stringify'
import * as winston from 'winston'
import { format } from 'winston'
import { getValidLogLevel } from './utils'

const formatter = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  format.printf((info) => {
    const header = `[${info.level.toUpperCase()}]: ${info.timestamp} : ${
      info.message
    }`
    const text = [header]

    Object.keys(info).forEach((key) => {
      if (['level', 'message', 'timestamp'].includes(key)) return

      if (typeof info[key] === 'string') {
        text.push(` - ${key} : ${info[key]}`)
      } else {
        text.push(` - ${key} : ${stringify(info[key])}`)
      }
    })

    return text.join('\n')
  }),
  format.colorize({
    all: true,
  })
)

interface ConsoleTransportOptions {
  level?: string
  silent?: boolean
}

export function createConsoleTransport(options: ConsoleTransportOptions = {}) {
  const level = getValidLogLevel(options.level, 'info')
  const silent = options.silent ?? false

  return new winston.transports.Console({
    level,
    format: formatter,
    stderrLevels: ['error', 'crit'],
    consoleWarnLevels: ['warning'],
    silent,
  })
}
