import Bottle from 'bottlejs'
import {
  FirebaseAdmin,
  InviteRepository,
  UserRefreshTokenRepository,
  UserRepository,
  JwtHelper,
} from './infra'
import { AuthService } from './app-services'
import { CurrentUserQueryService, InviteQueryService } from './query-services'

export function registerAuthModule(bottle: Bottle) {
  // Register Infra
  bottle.service('Auth.FirebaseAdmin', FirebaseAdmin, 'logger')
  bottle.service('Auth.InviteRepository', InviteRepository)
  bottle.service('Auth.UserRefreshTokenRepository', UserRefreshTokenRepository)
  bottle.service('Auth.UserRepository', UserRepository)
  bottle.service('Auth.JwtHelper', JwtHelper, 'config')

  // Register App Services
  bottle.service(
    'Auth.AuthService',
    AuthService,
    'Auth.FirebaseAdmin',
    'Auth.InviteRepository',
    'Auth.UserRefreshTokenRepository',
    'Auth.UserRepository',
    'Auth.JwtHelper',
    'sequelize'
  )

  // Register Query Services
  bottle.service(
    'Auth.CurrentUserQueryService',
    CurrentUserQueryService,
    'Auth.UserRepository'
  )
  bottle.service(
    'Auth.InviteQueryService',
    InviteQueryService,
    'Auth.InviteRepository'
  )
}
