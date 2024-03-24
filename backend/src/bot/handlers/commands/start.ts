import { handler } from '~/bot/handlers'
import filters from '~/bot/filters'
import views from '~/bot/handlers/views'

export default handler((composer) => {
  composer
    .command('start')
    .filter(filters.pm)
    .use(async (ctx) => {
      await ctx
        .send(await views.main.render(ctx, {}))
        .to(ctx.chat.id)
    })
})
