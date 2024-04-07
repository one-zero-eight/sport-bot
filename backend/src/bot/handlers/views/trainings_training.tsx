import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import type { TrainingDetailed } from '~/services/sport/types'
import { Day } from '~/utils/dates'
import { TIMEZONE } from '~/constants'

const VIEW_ID = 'trainings/training'

const BackButton = makeButton<{ day: Day }>({
  id: `${VIEW_ID}:back`,
  encode: ({ day }) => day.toString(),
  decode: data => ({ day: Day.fromString(data) }),
})
const CheckInButton = makeButton<{ trainingId: number, day: Day }>({
  id: `${VIEW_ID}:check-in`,
  encode: ({ trainingId, day }) => `${trainingId}:${day.toString()}`,
  decode: (data) => {
    const [trainingId, dayStr] = data.split(':')
    return {
      trainingId: Number(trainingId),
      day: Day.fromString(dayStr),
    }
  },
})
const CancelCheckInButton = makeButton<{ trainingId: number, day: Day }>({
  id: `${VIEW_ID}:cancel-check-in`,
  encode: ({ trainingId, day }) => `${trainingId}:${day.toString()}`,
  decode: (data) => {
    const [trainingId, dayStr] = data.split(':')
    return {
      trainingId: Number(trainingId),
      day: Day.fromString(dayStr),
    }
  },
})

export type Props = {
  training: TrainingDetailed
}

export default {
  render: async (ctx, { training }) => {
    const trainingDay = Day.fromDate(training.startsAt, TIMEZONE)
    return (
      <>
        {ctx.t['Views.Training.Message'](training)}
        <keyboard>
          {training.checkedIn && (
            <CancelCheckInButton trainingId={training.id} day={trainingDay}>
              {ctx.t['Views.Training.Buttons.CancelCheckIn']}
            </CancelCheckInButton>
          )}
          {training.checkInAvailable && (
            <CheckInButton trainingId={training.id} day={trainingDay}>
              {ctx.t['Views.Training.Buttons.CheckIn']}
            </CheckInButton>
          )}
          <br />
          <BackButton day={trainingDay}>
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

        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, { day: ctx.payload.day }))
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

        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, { day: ctx.payload.day }))
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.trainingsDayTrainings.render(ctx, ctx.payload))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx, Props> as View<Ctx, Props>
