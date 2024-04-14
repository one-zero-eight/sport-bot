import { Composer } from 'grammy'
import views from './views'
import type { Ctx } from '~/bot/context'

const composer = new Composer<Ctx>()

composer.on('callback_query:data', async (ctx) => {
  await ctx.answerCallbackQuery({
    text: ctx.t['Alerts.ButtonOutdated'],
    show_alert: true,
    cache_time: 60 * 5,
  })

  if (ctx.msg?.from) {
    await ctx
      .send(await views.main.render(ctx, {}))
      .to(ctx.from.id)
  }
})

export default composer
