import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'

const VIEW_ID = 'settings'

const buttons = {
  back: new Button({ id: [VIEW_ID, 'back'] }),
  language: new Button({ id: [VIEW_ID, 'language'] }),
}

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text(ctx.t['Views.Settings.Buttons.Language'], buttons.language.dataFor(null))
      .row()
      .text(ctx.t['Buttons.Back'], buttons.back.dataFor(null))

    return {
      type: 'text',
      text: ctx.t['Views.Settings.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(buttons.language.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.settingsLanguage.render(ctx, {}),
        })
      })

    composer
      .filter(buttons.back.filter)
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
