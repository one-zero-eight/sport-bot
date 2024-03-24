import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'

const VIEW_ID = 'settings'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
const LanguageButton = makeButton({ id: `${VIEW_ID}:language` })

export default {
  render: async ctx => (
    <>
      <>{ctx.t['Views.Settings.Message']}</>
      <keyboard>
        <LanguageButton>{ctx.t['Views.Settings.Buttons.Language']}</LanguageButton>
        <br />
        <BackButton>{ctx.t['Buttons.Back']}</BackButton>
      </keyboard>
    </>
  ),
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(LanguageButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.settingsLanguage.render(ctx, {}))
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.main.render(ctx, {}))
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
