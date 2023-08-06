import Bottle from 'bottlejs'
import { registerShared } from 'src/shared/register-dependencies'
import { registerModules } from 'src/modules/register-dependencies'
import { registerApi } from 'src/api/register-dependencies'

export const bottle = new Bottle()

registerShared(bottle)
registerModules(bottle)
registerApi(bottle)
