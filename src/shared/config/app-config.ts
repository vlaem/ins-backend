/**
 * Get the current environment, note this is different from the NODE_ENV variable.
 * i.e. an app can be in the env 'stage' but be running as NODE_ENV 'production'
 */
export function getAppEnv() {
  return process.env.APP_ENV || 'localhost'
}
