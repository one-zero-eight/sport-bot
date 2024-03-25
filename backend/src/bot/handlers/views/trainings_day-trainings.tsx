import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { TIMEZONE } from '~/constants'
import { getDateDayInTimezone, getDayBoundaries } from '~/utils/dates'

const VIEW_ID = 'trainings/day-trainings'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
const TrainingButton = makeButton<{ trainingId: number }>({
  id: `${VIEW_ID}:training`,
  encode: ({ trainingId }) => trainingId.toString(),
  decode: data => ({ trainingId: Number.parseInt(data) }),
})

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
    trainings.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())

    return (
      <>
        {ctx.t['Views.DayTrainings.Message']}
        <keyboard>
          {trainings.map((training) => {
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

            return (
              <>
                <TrainingButton trainingId={training.id}>
                  {`${statusEmoji} ${timeStart}—${timeEnd}`}
                </TrainingButton>
                <TrainingButton trainingId={training.id}>
                  {training.title}
                </TrainingButton>
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
      .filter(TrainingButton.filter)
      .use(async (ctx) => {
        const training = await ctx.domain.getTrainingForUser({
          telegramId: ctx.from!.id,
          trainingId: ctx.payload.trainingId,
        })
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsTraining.render(ctx, { training }))
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsDaysList.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx, Props> as View<Ctx, Props>
