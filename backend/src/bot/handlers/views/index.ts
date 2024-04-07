import type { Context, MiddlewareFn } from 'grammy'
import type { TgxElement } from '@telegum/tgx'
import main from './main'
import trainingsDaysList from './trainings_days-list'
import trainingsDayTrainings from './trainings_day-trainings'
import trainingsTraining from './trainings_training'
import semestersSummary from './semesters_summary'

// eslint-disable-next-line ts/ban-types
export type View<C extends Context, P = {}> = {
  render: (ctx: C, props: P) => Promise<TgxElement>
  middleware: () => MiddlewareFn<C>
}

export default {
  main,
  trainingsDaysList,
  trainingsDayTrainings,
  trainingsTraining,
  semestersSummary,
}
