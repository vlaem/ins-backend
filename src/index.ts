// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function require(moduleName: string): any

import { loadConfig } from './shared/config'
loadConfig()

const { umzug } = require('./shared/db/umzug')
const { serve } = require('./server')

umzug.up().then(() => {
  serve()
})
