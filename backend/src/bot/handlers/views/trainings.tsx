import { makeButton } from '@telegum/grammy-buttons'
import { ToggleCheckInButton } from './training'
import views from '.'
import { makeView } from '~/bot/utils/view'
import { TIMEZONE, TRAININGS_DAYS_LIST_COUNT } from '~/constants'
import { Day, clockTime } from '~/utils/dates'
import type { TrainingInfo } from '~/services/sport/types'
import { split } from '~/utils/strings'

const VIEW_ID = 'trainings'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })
export const TrainingsTabButton = makeButton<TrainingsTab>({
  id: `${VIEW_ID}:tab`,
  encode: encodeTrainingsTab,
  decode: decodeTrainingsTab,
})
const TrainingDetailsButton = makeButton<{
  trainingId: number
  fromTab: TrainingsTab
}>({
  id: `${VIEW_ID}:training-details`,
  encode: ({ trainingId, fromTab }) => `${trainingId}:${encodeTrainingsTab(fromTab)}`,
  decode: (data) => {
    const [trainingId, fromTab] = split(data, ':', 1)
    return {
      trainingId: Number(trainingId),
      fromTab: decodeTrainingsTab(fromTab),
    }
  },
})

export function encodeTrainingsTab(tab: TrainingsTab): string {
  switch (tab.type) {
    case 'all':
      return tab.day ? `all:${tab.day.toString()}` : 'all'
    case 'my':
      return 'my'
  }
}
export function decodeTrainingsTab(data: string): TrainingsTab {
  const [type, day] = data.split(':')
  switch (type) {
    case 'all':
      return day
        ? { type: 'all', day: Day.fromString(day) }
        : { type: 'all' }
    case 'my':
      return { type: 'my' }
    default:
      throw new Error(`Invalid tab type: ${type}.`)
  }
}

export type TrainingsTab =
  | { type: 'all', day?: Day }
  | { type: 'my' }

export type Props = {
  tab: TrainingsTab
}

const activeTab = (active: boolean, text: string) => active ? `•${text}•` : text

export default makeView<Props>({
  render: async (ctx, { tab }) => {
    const user = ctx.user!
    const today = Day.fromDate(new Date(), TIMEZONE)
    const selectedDay = (tab.type === 'all' && tab.day) || today
    const firstDay = today
    const lastDay = today.shift(TRAININGS_DAYS_LIST_COUNT - 1)

    let trainings: TrainingInfo[]
    let message
    switch (tab.type) {
      case 'all':
        trainings = await ctx.domain.getTrainingsForUser({
          telegramId: user.telegramId,
          from: selectedDay.asDate(TIMEZONE),
          to: selectedDay.shift(1).asDate(TIMEZONE),
        })
        message = ctx.t['Views.Trainings.Messages.AllClasses']
        break
      case 'my':
        trainings = await ctx.domain.getTrainingsForUser({
          telegramId: user.telegramId,
          from: firstDay.asDate(TIMEZONE),
          to: lastDay.shift(1).asDate(TIMEZONE),
        })
        trainings = trainings.filter(training => training.checkedIn || user.favoriteGroupIds.includes(training.groupId))
        if (trainings.length === 0) {
          message = ctx.t['Views.Trainings.Messages.NoMyClasses']
        } else {
          message = ctx.t['Views.Trainings.Messages.MyClasses']
        }
        break
    }

    const keyboard = (
      <>
        {firstDay.until(lastDay).map((day) => {
          const dayTrainings = trainings.filter((training) => {
            const trainingDay = Day.fromDate(training.startsAt, TIMEZONE)
            return trainingDay.compare(day) === 0
          })

          if (tab.type === 'my' && dayTrainings.length === 0) {
            return null
          }

          return (
            <>
              <TrainingsTabButton type="all" day={day}>
                {activeTab(
                  tab.type === 'all' && selectedDay.compare(day) === 0,
                  ctx.t['Views.Trainings.Buttons.Day'](day),
                )}
              </TrainingsTabButton>
              <br />
              {dayTrainings.map((training) => {
                const isFavorite = user.favoriteGroupIds.includes(training.groupId)
                const timeStart = clockTime(training.startsAt, TIMEZONE)
                const timeEnd = clockTime(training.endsAt, TIMEZONE)
                const statusEmoji = training.checkedIn
                  ? '🟢'
                  : training.checkInAvailable
                    ? '🔵'
                    : '🔴'

                return (
                  <>
                    <ToggleCheckInButton
                      trainingId={training.id}
                      action={training.checkedIn ? 'cancel-check-in' : 'check-in'}
                      renderDetails={false}
                      backTab={tab}
                    >
                      {`${statusEmoji} ${timeStart}–${timeEnd}`}
                    </ToggleCheckInButton>
                    <TrainingDetailsButton trainingId={training.id} fromTab={tab}>
                      {`${isFavorite ? '⭐️ ' : ''}${training.title}`}
                    </TrainingDetailsButton>
                    <br />
                  </>
                )
              })}
              <br />
            </>
          )
        })}
      </>
    )

    return (
      <>
        {message}
        <keyboard>
          <TrainingsTabButton type="my">
            {activeTab(tab.type === 'my', ctx.t['Views.Main.Buttons.TrainingsMy'])}
          </TrainingsTabButton>
          <TrainingsTabButton type="all">
            {activeTab(tab.type === 'all', ctx.t['Views.Main.Buttons.TrainingsAll'])}
          </TrainingsTabButton>
          <br />
          {keyboard}
          <br />
          <BackButton>{ctx.t['Buttons.Back']}</BackButton>
        </keyboard>
      </>
    )
  },
  setup: (composer, view) => {
    composer
      .filter(TrainingsTabButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await view.render(ctx, { tab: ctx.payload }))
        await ctx.answerCallbackQuery()
      })

    composer
      .filter(TrainingDetailsButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.training.render(ctx, {
            trainingId: ctx.payload.trainingId,
            backTab: ctx.payload.fromTab,
          }))
        await ctx.answerCallbackQuery()
      })

    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.main.render(ctx, {}))
        await ctx.answerCallbackQuery()
      })
  },
})
