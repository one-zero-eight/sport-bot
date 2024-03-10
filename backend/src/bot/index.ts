import { Bot } from 'grammy'
import plugins from './plugins'
import type { Ctx } from './context'
import type { Logger } from '~/lib/logging'

export function createBot({
  logger,
  token,
}: {
  logger: Logger
  token: string
}): Bot<Ctx> {
  const bot = new Bot<Ctx>(token)

  plugins.logging.install(bot, { logger })
  plugins.floodControl.install(bot)
  plugins.translations.install(bot)

  return bot
}
