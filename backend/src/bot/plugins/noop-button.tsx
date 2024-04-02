import type { TgxElement } from '@telegum/tgx'
import type { InstallFn } from '.'

const CALLBACK_QUERY_DATA = 'noop'

export function NoopButton({ children }: { children?: string }): TgxElement {
  return <button data={CALLBACK_QUERY_DATA}>{children || ' '}</button>
}

export const install: InstallFn = (bot) => {
  bot.callbackQuery(CALLBACK_QUERY_DATA, async (ctx, next) => {
    await ctx.answerCallbackQuery({ cache_time: 300 })
    return next()
  })
}
