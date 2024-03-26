import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import type { TrainingDetailed } from '~/services/sport/types'
import { getDayBoundaries, getTimezoneOffset } from '~/utils/dates'
import { TIMEZONE } from '~/constants'

const VIEW_ID = 'trainings/training'

const BackButton = makeButton<{ date: Date }>({
  id: `${VIEW_ID}:back`,
  encode: ({ date }) => date.toISOString(),
  decode: data => ({ date: new Date(data) }),
})
const CheckInButton = makeButton<{ trainingId: number, date: { year: number, month: number, day: number } }>({
  id: `${VIEW_ID}:check-in`,
  encode: ({ trainingId, date }) => `${trainingId}:${date.day}-${date.month}-${date.year}`,
  decode: (data) => {
    const [trainingId, date] = data.split(':')
    const [day, month, year] = date.split('-').map(Number)
    return { trainingId: Number(trainingId), date: { day, month, year } }
  },
})
const CancelCheckInButton = makeButton<{ trainingId: number, date: { year: number, month: number, day: number } }>({
  id: `${VIEW_ID}:cancel-check-in`,
  encode: ({ trainingId, date }) => `${trainingId}:${date.day}-${date.month}-${date.year}`,
  decode: (data) => {
    const [trainingId, date] = data.split(':')
    const [day, month, year] = date.split('-').map(Number)
    return { trainingId: Number(trainingId), date: { day, month, year } }
  },
})

export type Props = {
  training: TrainingDetailed
}

export default {
  render: async (ctx, { training }) => {
    const trainingDateInUtc = new Date(training.startsAt.getTime() - getTimezoneOffset(TIMEZONE))
    const trainingDate = {
      year: trainingDateInUtc.getUTCFullYear(),
      month: trainingDateInUtc.getUTCMonth() + 1,
      day: trainingDateInUtc.getUTCDate(),
    }

    return (
      <>
        {ctx.t['Views.Training.Message'](training)}
        <keyboard>
          {training.checkedIn && (
            <CancelCheckInButton trainingId={training.id} date={trainingDate}>
              {ctx.t['Views.Training.Buttons.CancelCheckIn']}
            </CancelCheckInButton>
          )}
          {training.checkInAvailable && (
            <CheckInButton trainingId={training.id} date={trainingDate}>
              {ctx.t['Views.Training.Buttons.CheckIn']}
            </CheckInButton>
          )}
          <br />
          <BackButton date={training.startsAt}>
            {ctx.t['Buttons.Back']}
          </BackButton>
        </keyboard>
      </>
    )
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(CheckInButton.filter)
      .use(async (ctx) => {
        await ctx.domain.checkInUserForTraining({
          telegramId: ctx.from!.id,
          trainingId: ctx.payload.trainingId,
        })
        ctx.answerCallbackQuery({
          text: 'Checked-in',
          show_alert: true,
        })

        const [startDate, _] = getDayBoundaries({
          ...ctx.payload.date,
          timezone: TIMEZONE,
        })

        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, { date: startDate }))
      })

    composer
      .filter(CancelCheckInButton.filter)
      .use(async (ctx) => {
        await ctx.domain.cancelCheckInUserForTraining({
          telegramId: ctx.from!.id,
          trainingId: ctx.payload.trainingId,
        })
        ctx.answerCallbackQuery({
          text: 'Cancelled check-in',
          show_alert: true,
        })

        const [startDate, _] = getDayBoundaries({
          ...ctx.payload.date,
          timezone: TIMEZONE,
        })

        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, { date: startDate }))
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, ctx.payload))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx, Props> as View<Ctx, Props>
