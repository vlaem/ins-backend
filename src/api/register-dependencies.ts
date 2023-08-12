import Bottle from 'bottlejs'
import {
  createAuthRoute,
  createHealthRoute,
  createInviteRoute,
  createCurrentUserRoute,
  createV1Route,
} from './routes/v1'
import {
  createMetricsMiddleware,
  createAuthorizeMiddleware,
} from './middlewares'
import { createApp } from './app'

export function registerApi(bottle: Bottle) {
  // Middleware
  bottle.service('metricsMiddleware', createMetricsMiddleware, 'logger')
  bottle.service(
    'authorizeMiddleware',
    createAuthorizeMiddleware,
    'Auth.AuthService'
  )

  // Routes
  bottle.service('healthRoute', createHealthRoute)
  bottle.service('authRoute', createAuthRoute, 'Auth.AuthService')
  bottle.service(
    'inviteRoute',
    createInviteRoute,
    'Auth.AuthService',
    'Auth.InviteQueryService'
  )
  bottle.service(
    'currentUserRoute',
    createCurrentUserRoute,
    'Auth.CurrentUserQueryService',
    'authorizeMiddleware'
  )
  bottle.service(
    'V1Route',
    createV1Route,
    'healthRoute',
    'authRoute',
    'inviteRoute',
    'currentUserRoute'
  )

  bottle.service('app', createApp, 'V1Route', 'metricsMiddleware', 'logger')
}
