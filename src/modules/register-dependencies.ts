import Bottle from 'bottlejs'
import { registerAuthModule } from 'src/modules/auth/register-dependencies'

export function registerModules(bottle: Bottle) {
  registerAuthModule(bottle)
}
