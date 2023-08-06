import Bottle from 'bottlejs'
import { Config } from 'src/shared/config'
import { createSequelize, createUmzug } from 'src/shared/db'
import { loggerFactory } from 'src/shared/logging'
import { registerAuthModule } from 'src/modules/auth'

export const bottle = new Bottle()

bottle.service('config', Config)
bottle.service('sequelize', createSequelize, 'config')
bottle.service('logger', loggerFactory, 'config')
bottle.service('umzug', createUmzug, 'logger', 'sequelize')

registerAuthModule(bottle)
