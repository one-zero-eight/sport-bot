import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'
import type { TrainingDetailed } from '~/services/sport/types'
import { getDayBoundaries, getTimezoneOffset } from '~/utils/dates'
import { TIMEZONE } from '~/constants'

const VIEW_ID = 'trainings/training'

const buttons = {
  back: new Button<{ date: Date }>({
    id: [VIEW_ID, 'back'],
    payloadEncoder: payload => payload.date.toISOString(),
    payloadDecoder: data => ({ date: new Date(data) }),
  }),
  action: new Button<{
    trainingId: number
    action: 'check-in' | 'cancel-check-in'
    date: { year: number, month: number, day: number }
  }>({
    id: [VIEW_ID, 'action'],
    payloadEncoder: ({ trainingId, date, action }) => `${trainingId}:${date.day}-${date.month}-${date.year}:${action}`,
    payloadDecoder: (data) => {
      const [trainingId, date, action] = data.split(':')
      const [day, month, year] = date.split('-').map(Number)
      return {
        trainingId: Number(trainingId),
        action: action as 'check-in' | 'cancel-check-in',
        date: { day, month, year },
      }
    },
  }),
}

export type Props = {
  training: TrainingDetailed
}

export default {
  render: async (ctx, { training }) => {
    const keyboard = new InlineKeyboard()
    const trainingDateInUtc = new Date(training.startsAt.getTime() - getTimezoneOffset(TIMEZONE))
    const trainingDate = {
      year: trainingDateInUtc.getUTCFullYear(),
      month: trainingDateInUtc.getUTCMonth() + 1,
      day: trainingDateInUtc.getUTCDate(),
    }
    if (training.checkedIn) {
      keyboard.text(
        ctx.t['Views.Training.Buttons.CancelCheckIn'],
        buttons.action.dataFor({ trainingId: training.id, date: trainingDate, action: 'cancel-check-in' }),
      )
    } else if (training.checkInAvailable) {
      keyboard.text(
        ctx.t['Views.Training.Buttons.CheckIn'],
        buttons.action.dataFor({ trainingId: training.id, date: trainingDate, action: 'check-in' }),
      )
    }
    keyboard.row()
    keyboard.text(ctx.t['Buttons.Back'], buttons.back.dataFor({ date: training.startsAt }))

    return {
      type: 'text',
      text: ctx.t['Views.Training.Message'](training),
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(buttons.action.filter)
      .use(async (ctx) => {
        if (ctx.payload.action === 'check-in') {
          await ctx.domain.checkInUserForTraining({
            telegramId: ctx.from!.id,
            trainingId: ctx.payload.trainingId,
          })
          ctx.answerCallbackQuery({
            text: 'Checked-in',
            show_alert: true,
          })
        } else if (ctx.payload.action === 'cancel-check-in') {
          await ctx.domain.cancelCheckInUserForTraining({
            telegramId: ctx.from!.id,
            trainingId: ctx.payload.trainingId,
          })
          ctx.answerCallbackQuery({
            text: 'Cancelled check-in',
            show_alert: true,
          })
        }

        const [startDate, _] = getDayBoundaries({
          ...ctx.payload.date,
          timezone: TIMEZONE,
        })

        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.trainingsDayTrainings.render(ctx, { date: startDate }),
        })
      })

    composer
      .filter(buttons.back.filter)
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
