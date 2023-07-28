import winston from 'winston'

/**
 * Returns a valid winston log level.
 * @param input - The log level to validate.
 * @param defaultValue - The default log level to use if the input is invalid.
 * @returns The validated log level, or the default log level if the input is invalid. If the default log level is invalid, 'error' is returned.
 */
export function getValidLogLevel(
  input: string | undefined,
  defaultValue: string
) {
  if (input && Object.keys(winston.config.syslog.levels).includes(input)) {
    return input
  }

  if (Object.keys(winston.config.syslog.levels).includes(defaultValue)) {
    return defaultValue
  }

  return 'error'
}
