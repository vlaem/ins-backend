import Bottle from 'bottlejs'
import { registerAuthModule } from '~/modules/auth/register-dependencies'

export function registerModules(bottle: Bottle) {
  registerAuthModule(bottle)
}
