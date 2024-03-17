import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'

const VIEW_ID = 'main'

const settingsButton = new Button({
  id: `${VIEW_ID}:settings`,
  payloadEncoder: () => '',
  payloadDecoder: () => null,
})

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text(ctx.t['Views.Buttons.Settings'], settingsButton.createCallbackData(null))

    return {
      type: 'text',
      text: ctx.t['Views.Main.Text'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(settingsButton.filter)
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
