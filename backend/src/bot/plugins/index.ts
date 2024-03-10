import type { Bot, Context } from 'grammy'
import * as logging from './logging'
import * as translations from './translations'
import * as floodControl from './flood-control'

// eslint-disable-next-line ts/ban-types
export type InstallFn<F = {}, O = undefined> =
  O extends undefined
    ? <C extends Context & F>(bot: Bot<C>) => void
    : <C extends Context & F>(bot: Bot<C>, options: O) => void

export default {
  logging,
  translations,
  floodControl,
}
