import type { Bot, Context } from 'grammy'
import * as logging from './logging'
import * as floodControl from './flood-control'
import * as messageSending from './message-sending'
import * as domain from './domain'
import * as translations from './translations'
import * as noopButton from './noop-button'
import * as safeCallbackQueries from './safe-callback-queries'

// eslint-disable-next-line ts/ban-types
export type InstallFn<F = {}, O = undefined> =
  O extends undefined
    ? <C extends Context & F>(bot: Bot<C>) => void
    : <C extends Context & F>(bot: Bot<C>, options: O) => void

export default {
  logging,
  floodControl,
  messageSending,
  domain,
  translations,
  noopButton,
  safeCallbackQueries,
}
