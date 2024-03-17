import { Composer } from 'grammy'
import type { Ctx } from '~/bot/context'

export function handler(registerFn: (composer: Composer<Ctx>) => void): Composer<Ctx> {
  const composer = new Composer<Ctx>()
  registerFn(composer)
  return composer
}

export { default } from './root'
