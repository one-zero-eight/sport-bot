import { handler } from '~/bot/handlers'
import filters from '~/bot/filters'
import views from '~/bot/handlers/views'

export default handler((composer) => {
  composer
    .command('start')
    .filter(filters.pm)
    .use(async (ctx) => {
      await ctx.sendMessage({
        chatId: ctx.chat.id,
        threadId: ctx.message.message_thread_id,
        content: await views.main.render(ctx, {}),
      })
    })
})
