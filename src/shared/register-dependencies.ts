import Bottle from 'bottlejs'
import { Config } from './config'
import { createSequelize, createUmzug } from './db'
import { loggerFactory } from './logging'

export function registerShared(bottle: Bottle) {
  bottle.service('config', Config)
  bottle.service('sequelize', createSequelize, 'config')
  bottle.service('logger', loggerFactory, 'config')
  bottle.service('umzug', createUmzug, 'logger', 'sequelize')
}
