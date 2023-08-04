declare function require(moduleName: string): any

import { loadConfig } from './shared/config'
loadConfig()

const { serve } = require('./server')
serve()
