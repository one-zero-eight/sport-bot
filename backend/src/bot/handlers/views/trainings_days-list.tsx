import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { TIMEZONE, TRAININGS_DAYS_LIST_COUNT } from '~/constants'
import { Day, getSpanningWeeks } from '~/utils/dates'
import { NoopButton } from '~/bot/plugins/noop-button'

const VIEW_ID = 'trainings/days-list'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
const DayButton = makeButton<{ day: Day }>({
  id: `${VIEW_ID}:day`,
  encode: ({ day }) => day.toString(),
  decode: data => ({ day: Day.fromString(data) }),
})

export default {
  render: async (ctx) => {
    // Make keyboard like this:
    //
    // Mo Tu We Th Fr Sa Su
    // -- -- 01 02 03 04 05
    // 06 07 08 -- -- -- --

    const today = Day.fromDate(new Date(), TIMEZONE)
    const lastDay = today.shift(TRAININGS_DAYS_LIST_COUNT - 1)
    const weeksDays = getSpanningWeeks(today, lastDay)

    const weekdaysRow = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const)
      .map(weekday => (
        <NoopButton>{ctx.t['Weekday.TwoLetters'](weekday)}</NoopButton>
      ))
    const daysRows = weeksDays.map(weekDays => (
      <>
        {weekDays.map(day => (
          day === null
            ? <NoopButton />
            : <DayButton day={day}>{day.date.toString()}</DayButton>
        ))}
        <br />
      </>
    ))

    return (
      <>
        {ctx.t['Views.TrainingsDaysList.Message']}
        <keyboard>
          {weekdaysRow}
          <br />
          {daysRows}
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
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, { day: ctx.payload.day }))
        ctx.answerCallbackQuery()
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.main.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
