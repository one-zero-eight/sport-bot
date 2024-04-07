import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'

const VIEW_ID = 'settings/language'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
const SetLanguageButton = makeButton<{ lang: 'en' | 'ru' }>({
  id: `${VIEW_ID}:set-language`,
  encode: ({ lang }) => lang,
  decode: lang => ({ lang: lang === 'ru' ? 'ru' : 'en' }),
})

export default {
  render: async ctx => (
    <>
      <>{ctx.t['Views.LanguageSettings.Message']}</>
      <keyboard>
        <SetLanguageButton lang="ru">🇷🇺 Русский</SetLanguageButton>
        <SetLanguageButton lang="en">🇬🇧 English</SetLanguageButton>
        <br />
        <BackButton>{ctx.t['Buttons.Back']}</BackButton>
      </keyboard>
    </>
  ),
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(SetLanguageButton.filter)
      .use(async (ctx) => {
        await ctx.domain.updateUser({
          telegramId: ctx.user!.telegramId,
          language: ctx.payload.lang,
        })
        ctx.updateLanguage(ctx.payload.lang)
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.settings.render(ctx, {}))
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.settings.render(ctx, {}))
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
