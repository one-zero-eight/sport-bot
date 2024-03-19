import { Composer, InlineKeyboard } from 'grammy'
import type { View } from '.'
import views from '.'
import { TIMEZONE, TRAININGS_DAYS_LIST_COUNT } from '~/constants'
import type { Ctx } from '~/bot/context'
import { Button } from '~/utils/buttons'
import { getDateDayInTimezone, getDayBoundaries } from '~/utils/dates'

const VIEW_ID = 'trainings/day-trainings'

const buttons = {
  back: new Button({ id: [VIEW_ID, 'back'] }),
  day: new Button<Date>({
    id: [VIEW_ID, 'day'],
    payloadEncoder: data => data.toISOString(),
    payloadDecoder: data => new Date(data),
  }),
}

export default {
  render: async (ctx) => {
    const keyboard = new InlineKeyboard()
    const now = new Date()

    for (let i = 0; i < TRAININGS_DAYS_LIST_COUNT; i++) {
      const actualDate = new Date(now.getTime())
      actualDate.setDate(now.getDate() + i)

      const day = getDateDayInTimezone(actualDate, TIMEZONE)
      const [timezoneDate, _] = getDayBoundaries({
        ...day,
        timezone: TIMEZONE,
      })

      keyboard
        .text(
          ctx.t['Views.TrainingsDaysList.Buttons.Day'](timezoneDate),
          buttons.day.dataFor(actualDate),
        )
        .row()
    }

    keyboard.row()
    keyboard.text(ctx.t['Buttons.Back'], buttons.back.dataFor(null))

    return {
      type: 'text',
      text: ctx.t['Views.TrainingsDaysList.Message'],
      keyboard: keyboard,
    }
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(buttons.day.filter)
      .use(async (ctx) => {
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.trainingsDayTrainings.render(ctx, { date: ctx.payload }),
        })
        ctx.answerCallbackQuery()
      })

    composer
      .filter(buttons.back.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx.editMessage({
          chatId: ctx.chat!.id,
          messageId: ctx.callbackQuery.message!.message_id,
          content: await views.main.render(ctx, {}),
        })
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
