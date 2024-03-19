import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'

const VIEW_ID = 'main'

const buttons = {
  settings: new Button({ id: [VIEW_ID, 'settings'] }),
  trainings: new Button({ id: [VIEW_ID, 'trainings'] }),
}

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text(ctx.t['Views.Main.Buttons.Settings'], buttons.settings.dataFor(null))
      .text(ctx.t['Views.Main.Buttons.Trainings'], buttons.trainings.dataFor(null))

    return {
      type: 'text',
      text: ctx.t['Views.Main.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(buttons.settings.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.settings.render(ctx, {}),
        })
      })

    composer
      .filter(buttons.trainings.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.trainingsDaysList.render(ctx, {}),
        })
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
