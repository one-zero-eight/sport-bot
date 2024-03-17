import type { Context, MiddlewareFn } from 'grammy'
import main from './main'
import settings from './settings'
import settingsLanguage from './settings_language'
import trainingsDaysList from './trainings_days-list'
import trainingsDayTrainings from './trainings_day-trainings'
import trainingsTraining from './trainings_training'
import type { MessageContent } from '~/bot/plugins/message-sending'

// eslint-disable-next-line ts/ban-types
export type View<C extends Context, P = {}> = {
  render: (ctx: C, props: P) => Promise<MessageContent>
  middleware: () => MiddlewareFn<C>
}

export default {
  main,
  settings,
  settingsLanguage,
  trainingsDaysList,
  trainingsDayTrainings,
  trainingsTraining,
}
