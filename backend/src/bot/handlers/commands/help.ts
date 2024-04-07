import { handler } from '~/bot/handlers'
import filters from '~/bot/filters'

export default handler((composer) => {
  composer
    .command('help')
    .filter(filters.pm)
    .use(async (ctx) => {
      await ctx
        .send(ctx.t['Messages.Help'])
        .with({ linkPreviewOptions: { is_disabled: true } })
        .to(ctx.chat.id)
    })
})
