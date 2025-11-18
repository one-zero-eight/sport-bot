import { Bot } from 'grammy'
import { SocksProxyAgent } from 'socks-proxy-agent'
import plugins from './plugins'
import handlers from './handlers'
import type { Ctx } from './context'
import { handleError } from './handle-error'
import type { Logger } from '~/utils/logging'
import type { Domain } from '~/domain'
import type { Config } from '~/config'

export function createBot({
  logger,
  token,
  config,
  domain,
}: {
  logger: Logger
  token: string
  config: Config
  domain: Domain
}): Bot<Ctx> {
  // Setup SOCKS proxy if URL is specified
  let socksAgent
  if (config.telegramProxyUrl) {
    socksAgent = new SocksProxyAgent(config.telegramProxyUrl)
  }

  const bot = new Bot<Ctx>(token, { client: { baseFetchConfig: { agent: socksAgent } } })

  bot.catch(handleError)

  plugins.safeCallbackQueries.install(bot)
  plugins.logging.install(bot, { logger })
  plugins.floodControl.install(bot)
  plugins.messageSending.install(bot)
  plugins.domain.install(bot, { domain, config })
  plugins.translations.install(bot)
  plugins.noopButton.install(bot)

  bot.use(handlers)

  return bot
}
