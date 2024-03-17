import { Bot } from 'grammy'
import plugins from './plugins'
import handlers from './handlers'
import type { Ctx } from './context'
import type { Logger } from '~/lib/logging'
import type { Domain } from '~/domain'

export function createBot({
  logger,
  token,
  domain,
}: {
  logger: Logger
  token: string
  domain: Domain
}): Bot<Ctx> {
  const bot = new Bot<Ctx>(token)

  plugins.logging.install(bot, { logger })
  plugins.floodControl.install(bot)
  plugins.parseMode.install(bot, { parseMode: 'HTML' })
  plugins.messageSending.install(bot)
  plugins.domain.install(bot, { domain })
  plugins.translations.install(bot)

  bot.use(handlers)

  return bot
}
