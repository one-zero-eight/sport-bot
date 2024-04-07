import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { TIMEZONE } from '~/constants'
import { Day, clockTime } from '~/utils/dates'

const VIEW_ID = 'trainings/day-trainings'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
const TrainingButton = makeButton<{
  trainingId: number
  action: 'check-in' | 'cancel-check-in' | 'details'
}>({
  id: `${VIEW_ID}:training`,
  encode: ({ trainingId, action }) => `${trainingId}:${action}`,
  decode: (data) => {
    const [trainingId, action] = data.split(':')
    switch (action) {
      case 'check-in':
      case 'cancel-check-in':
      case 'details':
        break
      default:
        throw new Error(`Invalid action: ${action}`)
    }
    return {
      trainingId: Number(trainingId),
      action: action,
    }
  },
})

export type Props = { day: Day }

const render: View<Ctx, Props>['render'] = async (ctx, { day }) => {
  const [from, to] = day.boundaries()
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
          const timeStart = clockTime(training.startsAt, TIMEZONE)
          const timeEnd = clockTime(training.endsAt, TIMEZONE)
          const statusEmoji = training.checkedIn
            ? '🟢'
            : training.checkInAvailable
              ? '🔵'
              : '🔴'

          return (
            <>
              <TrainingButton
                trainingId={training.id}
                action={training.checkedIn ? 'cancel-check-in' : 'check-in'}
              >
                {`${statusEmoji} ${timeStart}—${timeEnd}`}
              </TrainingButton>
              <TrainingButton trainingId={training.id} action="details">
                {training.title}
              </TrainingButton>
              <br />
            </>
          )
        })}
        <BackButton>{ctx.t['Buttons.Back']}</BackButton>
      </keyboard>
    </>
  )
}

export default {
  render: render,
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(TrainingButton.filter)
      .use(async (ctx) => {
        const telegramId = ctx.from.id
        const trainingId = ctx.payload.trainingId
        switch (ctx.payload.action) {
          case 'check-in': {
            const training = await ctx.domain.getTrainingForUser({ telegramId, trainingId })
            let alertMessage
            if (training.checkedIn) {
              alertMessage = ctx.t['Alert.AlreadyCheckedIn']
            } else if (!training.checkInAvailable) {
              alertMessage = ctx.t['Alert.CheckInUnavailable']
            } else {
              try {
                await ctx.domain.checkInUserForTraining({ telegramId, trainingId })
                alertMessage = ctx.t['Alert.CheckInSuccessful'](training)
              } catch (error) {
                ctx.logger.error({
                  msg: 'failed to check-in a user',
                  error: error,
                  telegramId: telegramId,
                  trainingId: trainingId,
                })
                alertMessage = ctx.t['Alert.CheckInError']
              }
            }
            ctx.answerCallbackQuery({ text: alertMessage, show_alert: true })
            await ctx
              .edit(ctx.from.id, ctx.msg!.message_id)
              .to(await render(ctx, { day: Day.fromDate(training.startsAt, TIMEZONE) }))
            break
          }
          case 'cancel-check-in': {
            const training = await ctx.domain.getTrainingForUser({ telegramId, trainingId })
            let alertMessage
            if (!training.checkedIn) {
              alertMessage = ctx.t['Alert.NotCheckedIn']
            } else {
              try {
                await ctx.domain.cancelCheckInUserForTraining({ telegramId, trainingId })
                alertMessage = ctx.t['Alert.CheckInCancelled'](training)
              } catch (error) {
                ctx.logger.error({
                  msg: 'failed to cancel check-in for a user',
                  error: error,
                  telegramId: telegramId,
                  trainingId: trainingId,
                })
                alertMessage = ctx.t['Alert.CancelCheckInError']
              }
            }
            ctx.answerCallbackQuery({ text: alertMessage, show_alert: true })
            await ctx
              .edit(ctx.from.id, ctx.msg!.message_id)
              .to(await render(ctx, { day: Day.fromDate(training.startsAt, TIMEZONE) }))
            break
          }
          case 'details': {
            const training = await ctx.domain.getTrainingForUser({ telegramId, trainingId })
            ctx.answerCallbackQuery()
            await ctx
              .edit(ctx.from.id, ctx.msg!.message_id)
              .to(await views.trainingsTraining.render(ctx, { training }))
            break
          }
          default:
            throw new Error(`Invalid action: ${ctx.payload.action}.`)
        }
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.trainingsDaysList.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx, Props> as View<Ctx, Props>
