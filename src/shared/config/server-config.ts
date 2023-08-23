export function getPort() {
  return Number.parseInt(process.env.PORT || '80')
}
