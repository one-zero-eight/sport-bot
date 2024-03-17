import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'
import type { TrainingDetailed } from '~/services/sport/types'

const VIEW_ID = 'trainings/training'

const backButton = new Button<{ date: Date }>({
  id: `${VIEW_ID}:back`,
  payloadEncoder: payload => payload.date.toISOString(),
  payloadDecoder: data => ({ date: new Date(data) }),
})

const checkInButton = new Button<{ trainingId: number }>({
  id: `${VIEW_ID}:check-in`,
  payloadEncoder: ({ trainingId }) => trainingId.toString(),
  payloadDecoder: data => ({ trainingId: Number.parseInt(data) }),
})
const cancelCheckInButton = new Button<{ trainingId: number }>({
  id: `${VIEW_ID}:cancel-check-in`,
  payloadEncoder: ({ trainingId }) => trainingId.toString(),
  payloadDecoder: data => ({ trainingId: Number.parseInt(data) }),
})

export type Props = {
  training: TrainingDetailed
}

export default {
  render: async (ctx, { training }) => {
    const keyboard = new InlineKeyboard()
    if (training.checkedIn) {
      keyboard.text(
        ctx.t['Views.Training.Buttons.CancelCheckIn'],
        cancelCheckInButton.createCallbackData({ trainingId: training.id }),
      )
    } else if (training.checkInAvailable) {
      keyboard.text(
        ctx.t['Views.Training.Buttons.CheckIn'],
        checkInButton.createCallbackData({ trainingId: training.id }),
      )
    }
    keyboard.row()
    keyboard.text(ctx.t['Buttons.Back'], backButton.createCallbackData({ date: training.startsAt }))

    return {
      type: 'text',
      text: ctx.t['Views.Training.Message'](training),
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(checkInButton.filter)
      .use(async (ctx) => {
        await ctx.domain.checkInUserForTraining({
          telegramId: ctx.from!.id,
          trainingId: ctx.payload.trainingId,
        })
        ctx.answerCallbackQuery({
          text: 'Checked-in',
          show_alert: true,
        })
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.main.render(ctx, {}),
        })
      })

    composer
      .filter(cancelCheckInButton.filter)
      .use(async (ctx) => {
        await ctx.domain.cancelCheckInUserForTraining({
          telegramId: ctx.from!.id,
          trainingId: ctx.payload.trainingId,
        })
        ctx.answerCallbackQuery({
          text: 'Canceled check-in',
          show_alert: true,
        })
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.main.render(ctx, {}),
        })
      })

    composer
      .filter(backButton.filter)
      .use(async (ctx) => {
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.trainingsDayTrainings.render(ctx, ctx.payload),
        })
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx, Props> as View<Ctx, Props>
