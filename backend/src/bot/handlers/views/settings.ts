import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'

const VIEW_ID = 'settings'

const backButton = new Button({
  id: `${VIEW_ID}:back`,
  payloadEncoder: () => '',
  payloadDecoder: () => null,
})

const languageSettingsButton = new Button({
  id: `${VIEW_ID}:language`,
  payloadEncoder: () => '',
  payloadDecoder: () => null,
})

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text(ctx.t['Views.Settings.Buttons.Language'], languageSettingsButton.createCallbackData(null))
      .row()
      .text(ctx.t['Buttons.Back'], backButton.createCallbackData(null))

    return {
      type: 'text',
      text: ctx.t['Views.Settings.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(languageSettingsButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.settingsLanguage.render(ctx, {}),
        })
      })

    composer
      .filter(backButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.main.render(ctx, {}),
        })
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
