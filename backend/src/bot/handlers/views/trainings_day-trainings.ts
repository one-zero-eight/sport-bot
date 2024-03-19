import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'
import { getDateDayInTimezone, getDayBoundaries } from '~/utils/dates'
import { TIMEZONE } from '~/constants'

const VIEW_ID = 'trainings/days-list'

const buttons = {
  back: new Button({ id: [VIEW_ID, 'back'] }),
  training: new Button<{ trainingId: number }>({
    id: [VIEW_ID, 'training'],
    payloadEncoder: ({ trainingId }) => trainingId.toString(),
    payloadDecoder: data => ({ trainingId: Number.parseInt(data) }),
  }),
}

export type Props = {
  date: Date
}

export default {
  render: async (ctx, { date }) => {
    const { year, month, day } = getDateDayInTimezone(date, TIMEZONE)
    const [from, to] = getDayBoundaries({
      year: year,
      month: month,
      day: day,
      timezone: TIMEZONE,
    })

    const trainings = await ctx.domain.getTrainingsForUser({
      telegramId: ctx.from!.id,
      from: from,
      to: to,
    })

    const keyboard = new InlineKeyboard()
    trainings
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .forEach((training) => {
        const timeStart = training.startsAt.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: TIMEZONE,
        })
        const timeEnd = training.endsAt.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: TIMEZONE,
        })
        const statusEmoji = training.checkedIn
          ? '🟢'
          : training.checkInAvailable
            ? '🔵'
            : '🔴'

        const data = buttons.training.dataFor({ trainingId: training.id })
        keyboard.text(`${statusEmoji} ${timeStart}—${timeEnd}`, data)
        keyboard.text(training.title, data)
        keyboard.row()
      })
    keyboard.text(ctx.t['Buttons.Back'], buttons.back.dataFor(null))

    return {
      type: 'text',
      text: ctx.t['Views.DayTrainings.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(buttons.training.filter)
      .use(async (ctx) => {
        const training = await ctx.domain.getTrainingForUser({
          telegramId: ctx.from!.id,
          trainingId: ctx.payload.trainingId,
        })
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.trainingsTraining.render(ctx, { training }),
        })
      })

    composer
      .filter(buttons.back.filter)
      .use(async (ctx) => {
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.trainingsDaysList.render(ctx, {}),
        })
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx, Props> as View<Ctx, Props>
