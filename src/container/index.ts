import Bottle from 'bottlejs'
import { registerShared } from '~/shared/register-dependencies'
import { registerModules } from '~/modules/register-dependencies'
import { registerApi } from '~/api/register-dependencies'

export const bottle = new Bottle()

registerShared(bottle)
registerModules(bottle)
registerApi(bottle)
