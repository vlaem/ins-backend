export function getConsoleLevel() {
  return process.env.LOGGER_CONSOLE_LEVEL || 'info'
}

export function isConsoleSilent() {
  return process.env.LOGGER_CONSOLE_SILENT === 'true'
}
