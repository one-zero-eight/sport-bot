import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { TIMEZONE, TRAININGS_DAYS_LIST_COUNT } from '~/constants'
import { getDateDayInTimezone, getDayBoundaries } from '~/utils/dates'

const VIEW_ID = 'trainings/days-list'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
const DayButton = makeButton<{ date: Date }>({
  id: `${VIEW_ID}:day`,
  encode: ({ date }) => date.toISOString(),
  decode: data => ({ date: new Date(data) }),
})

export default {
  render: async (ctx) => {
    const now = new Date()

    return (
      <>
        {ctx.t['Views.TrainingsDaysList.Message']}
        <keyboard>
          {Array(TRAININGS_DAYS_LIST_COUNT).fill(null).map((_, i) => {
            const actualDate = new Date(now.getTime())
            actualDate.setDate(now.getDate() + i)

            const day = getDateDayInTimezone(actualDate, TIMEZONE)
            const [timezoneDate, __] = getDayBoundaries({
              ...day,
              timezone: TIMEZONE,
            })

            return (
              <>
                <DayButton date={actualDate}>
                  {ctx.t['Views.TrainingsDaysList.Buttons.Day'](timezoneDate)}
                </DayButton>
                <br/>
              </>
            )
          })}
          <BackButton>{ctx.t['Buttons.Back']}</BackButton>
        </keyboard>
      </>
    )
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(DayButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, { date: ctx.payload.date }))
        ctx.answerCallbackQuery()
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.main.render(ctx, {}))
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
