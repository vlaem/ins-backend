// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function require(moduleName: string): any

import { loadConfig } from './shared/config'
loadConfig()

const { umzug } = require('./shared/db/umzug')
umzug.up().then(() => {
  process.exit(0)
})
