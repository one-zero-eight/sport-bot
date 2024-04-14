import { makeButton } from '@telegum/grammy-buttons'
import type { TrainingsTab } from './trainings'
import { TrainingsTabButton, decodeTrainingsTab, encodeTrainingsTab } from './trainings'
import views from '.'
import { makeView } from '~/bot/utils/view'
import { split } from '~/utils/strings'

const VIEW_ID = 'training'

export const ToggleCheckInButton = makeButton<{
  trainingId: number
  action: 'check-in' | 'cancel-check-in'
  /**
   * Whether to render the training details view after the action is performed
   * or the trainings list view.
   */
  renderDetails: boolean
  backTab: TrainingsTab
}>({
  id: `${VIEW_ID}:toggle-check-in`,
  encode: ({ trainingId, action, renderDetails, backTab }) => `${trainingId}:${action}:${renderDetails ? 1 : 0}:${encodeTrainingsTab(backTab)}`,
  decode: (data) => {
    const [trainingId, action, renderDetails, backTab] = split(data, ':', 3)
    switch (action) {
      case 'check-in':
      case 'cancel-check-in':
        break
      default:
        throw new Error(`Invalid action: ${action}.`)
    }
    return {
      trainingId: Number(trainingId),
      action: action,
      renderDetails: Boolean(Number(renderDetails)),
      backTab: decodeTrainingsTab(backTab),
    }
  },
})
const ToggleFavoriteButton = makeButton<{
  trainingId: number
  action: 'add' | 'remove'
  backTab: TrainingsTab
}>({
  id: `${VIEW_ID}:toggle-favorite`,
  encode: ({ trainingId, action, backTab }) => `${trainingId}:${action}:${encodeTrainingsTab(backTab)}`,
  decode: (data) => {
    const [trainingId, action, backTab] = split(data, ':', 2)
    switch (action) {
      case 'add':
      case 'remove':
        break
      default:
        throw new Error(`Invalid action: ${action}.`)
    }
    return {
      trainingId: Number(trainingId),
      action: action,
      backTab: decodeTrainingsTab(backTab),
    }
  },
})

export type Props = {
  trainingId: number
  backTab: TrainingsTab
}

export default makeView<Props>({
  render: async (ctx, { trainingId, backTab }) => {
    const user = ctx.user!
    const training = await ctx.domain.getTrainingForUser({
      telegramId: user.telegramId,
      trainingId: trainingId,
    })

    return (
      <>
        {ctx.t['Views.Training.Message'](training)}
        <keyboard>
          {training.checkedIn && (
            <ToggleCheckInButton
              trainingId={training.id}
              action="cancel-check-in"
              renderDetails
              backTab={backTab}
            >
              {ctx.t['Views.Training.Buttons.CancelCheckIn']}
            </ToggleCheckInButton>
          )}
          {training.checkInAvailable && (
            <ToggleCheckInButton
              trainingId={training.id}
              action="check-in"
              renderDetails
              backTab={backTab}
            >
              {ctx.t['Views.Training.Buttons.CheckIn']}
            </ToggleCheckInButton>
          )}
          <br />
          <ToggleFavoriteButton
            trainingId={training.id}
            action={user.favoriteGroupIds.includes(training.groupId) ? 'remove' : 'add'}
            backTab={backTab}
          >
            {user.favoriteGroupIds.includes(training.groupId)
              ? ctx.t['Views.Training.Buttons.RemoveFromFavorites']
              : ctx.t['Views.Training.Buttons.AddToFavorites']}
          </ToggleFavoriteButton>
          <br />
          <TrainingsTabButton {...backTab}>
            {ctx.t['Buttons.Back']}
          </TrainingsTabButton>
        </keyboard>
      </>
    )
  },
  setup: (composer, view) => {
    composer
      .filter(ToggleCheckInButton.filter)
      .use(async (ctx) => {
        const telegramId = ctx.user!.telegramId
        const { trainingId, action, renderDetails, backTab } = ctx.payload
        let alertMessage
        switch (action) {
          case 'check-in': {
            const result = await ctx.domain.checkInUserForTraining({ telegramId, trainingId })

            switch (result.type) {
              case 'already-checked-in':
                alertMessage = ctx.t['Alert.AlreadyCheckedIn']
                break
              case 'check-in-unavailable':
                alertMessage = ctx.t['Alert.CheckInUnavailable']
                break
              case 'checked-in':
                alertMessage = ctx.t['Alert.CheckInSuccessful'](result.training)
                break
              case 'failed':
                alertMessage = ctx.t['Alert.CheckInError']
                break
            }

            break
          }
          case 'cancel-check-in': {
            const result = await ctx.domain.cancelCheckInUserForTraining({ telegramId, trainingId })

            switch (result.type) {
              case 'not-checked-in':
                alertMessage = ctx.t['Alert.NotCheckedIn']
                break
              case 'cancelled':
                alertMessage = ctx.t['Alert.CheckInCancelled'](result.training)
                break
              case 'failed':
                alertMessage = ctx.t['Alert.CancelCheckInError']
                break
            }

            break
          }
        }
        if (renderDetails) {
          await ctx
            .edit(ctx.from.id, ctx.msg!.message_id)
            .with({ ignoreNotModifiedError: true })
            .to(await view.render(ctx, { trainingId, backTab }))
        } else {
          await ctx
            .edit(ctx.from.id, ctx.msg!.message_id)
            .with({ ignoreNotModifiedError: true })
            .to(await views.trainings.render(ctx, { tab: backTab }))
        }
        await ctx.answerCallbackQuery({ text: alertMessage, show_alert: true })
      })

    composer
      .filter(ToggleFavoriteButton.filter)
      .use(async (ctx) => {
        const { trainingId, action, backTab } = ctx.payload
        const user = ctx.user!
        let alertMessage

        const { title, groupId } = await ctx.domain.getTrainingForUser({
          telegramId: user.telegramId,
          trainingId: trainingId,
        })

        switch (action) {
          case 'add':
            if (!user.favoriteGroupIds.includes(groupId)) {
              ctx.user = await ctx.domain.updateUser({
                telegramId: user.telegramId,
                favoriteGroupIds: [...user.favoriteGroupIds, groupId],
              })
            }
            alertMessage = ctx.t['Views.Training.Alerts.AddedToFavorites'](title)
            break
          case 'remove':
            if (user.favoriteGroupIds.includes(groupId)) {
              ctx.user = await ctx.domain.updateUser({
                telegramId: user.telegramId,
                favoriteGroupIds: user.favoriteGroupIds.filter(id => id !== groupId),
              })
            }
            alertMessage = ctx.t['Views.Training.Alerts.RemovedFromFavorites'](title)
            break
        }

        await ctx.answerCallbackQuery({ text: alertMessage })
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await view.render(ctx, { trainingId, backTab }))
      })
  },
})
