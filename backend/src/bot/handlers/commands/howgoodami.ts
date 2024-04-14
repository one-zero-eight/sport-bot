import { handler } from '~/bot/handlers'
import filters from '~/bot/filters'

export default handler((composer) => {
  composer
    .command('howgoodami')
    .filter(filters.pm)
    .use(async (ctx) => {
      const messageId = ctx.message.message_id

      await ctx.reply(ctx.t['HowGoodAmI.Thinking'])

      ctx.domain.getStudentBetterThanPercent(ctx.user.telegramId)
        .then((percent) => {
          ctx.api.sendMessage(
            ctx.chat.id,
            ctx.t['HowGoodAmI.Answer'](percent),
            { reply_parameters: { message_id: messageId } },
          )
        })
        .catch((err) => {
          ctx.logger.error(err)
          ctx.api.sendMessage(
            ctx.chat.id,
            ctx.t['HowGoodAmI.Failed'],
            { reply_parameters: { message_id: messageId } },
          )
        })
    })
})
