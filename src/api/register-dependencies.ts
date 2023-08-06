import Bottle from 'bottlejs'
import {
  createAuthRoute,
  createHealthRoute,
  createInviteRoute,
  createV1Route,
} from './routes/v1'
import { createApp } from './app'

export function registerApi(bottle: Bottle) {
  bottle.service('healthRoute', createHealthRoute)
  bottle.service('authRoute', createAuthRoute, 'Auth.AuthService')
  bottle.service(
    'inviteRoute',
    createInviteRoute,
    'Auth.AuthService',
    'Auth.InviteQueryService'
  )
  bottle.service(
    'V1Route',
    createV1Route,
    'healthRoute',
    'authRoute',
    'inviteRoute'
  )
  bottle.service('app', createApp, 'V1Route', 'logger')
}
