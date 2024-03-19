import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'

const VIEW_ID = 'settings/language'

const buttons = {
  back: new Button({ id: [VIEW_ID, 'back'] }),
  setLanguage: new Button<'en' | 'ru'>({
    id: [VIEW_ID, 'set-language'],
    payloadEncoder: data => data,
    payloadDecoder: data => data === 'ru' ? 'ru' : 'en',
  }),
}

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('🇷🇺 Русский', buttons.setLanguage.dataFor('ru'))
      .text('🇬🇧 English', buttons.setLanguage.dataFor('en'))
      .row()
      .text(ctx.t['Buttons.Back'], buttons.back.dataFor(null))

    return {
      type: 'text',
      text: ctx.t['Views.LanguageSettings.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(buttons.setLanguage.filter)
      .use(async (ctx) => {
        await ctx.domain.updateUser({
          telegramId: ctx.user!.telegramId,
          language: ctx.payload,
        })
        ctx.renegotiateTranslation(ctx.payload)
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.settings.render(ctx, {}),
        })
      })

    composer
      .filter(buttons.back.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.settings.render(ctx, {}),
        })
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
