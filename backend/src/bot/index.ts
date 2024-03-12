import { Bot } from 'grammy'
import plugins from './plugins'
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
  plugins.domain.install(bot, { domain })
  plugins.translations.install(bot)

  bot.command('start', async (ctx) => {
    ctx.reply(`${ctx.t.Welcome}\n\n${JSON.stringify(ctx.user)}`)
  })

  bot.command('howgoodami', async (ctx) => {
    await ctx.api.sendMessage(
      ctx.chat.id,
      ctx.t['HowGoodAmI.Thinking'],
    )

    ctx.domain.getStudentBetterThanPercent(ctx.user!)
      .then((percent) => {
        ctx.api.sendMessage(
          ctx.chat.id,
          ctx.t['HowGoodAmI.Answer'](percent),
          { reply_parameters: { message_id: ctx.update.message!.message_id } },
        )
      })
      .catch((err) => {
        ctx.logger.error(err)
        ctx.api.sendMessage(
          ctx.chat.id,
          ctx.t['HowGoodAmI.Failed'],
          { reply_parameters: { message_id: ctx.update.message!.message_id } },
        )
      })
  })

  return bot
}
