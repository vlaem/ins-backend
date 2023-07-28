import dotenv from 'dotenv'

export const loadConfig = () => {
  // Do not load config if we are in test environment
  if (process.env.NODE_ENV === 'test') {
    return
  }

  dotenv.config({ path: '.env' })
}
