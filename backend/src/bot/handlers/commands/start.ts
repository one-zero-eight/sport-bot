import { handler } from '~/bot/handlers'
import filters from '~/bot/filters'

export default handler((composer) => {
  composer
    .command('start')
    .filter(filters.pm)
    .use(async (ctx) => {
      await ctx.reply(ctx.t.Welcome)
    })
})
