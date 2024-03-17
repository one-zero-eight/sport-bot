import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'

const VIEW_ID = 'settings/language'

const backButton = new Button({
  id: `${VIEW_ID}:back`,
  payloadEncoder: () => '',
  payloadDecoder: () => null,
})

const setLanguageButton = new Button<'en' | 'ru'>({
  id: `${VIEW_ID}:setLanguage`,
  payloadEncoder: lang => lang,
  payloadDecoder: data => data === 'ru' ? 'ru' : 'en',
})

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('🇷🇺 Русский', setLanguageButton.createCallbackData('ru'))
      .text('🇬🇧 English', setLanguageButton.createCallbackData('en'))
      .row()
      .text(ctx.t['Buttons.Back'], backButton.createCallbackData(null))

    return {
      type: 'text',
      text: ctx.t['Views.LanguageSettings.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(setLanguageButton.filter)
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
      .filter(backButton.filter)
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
