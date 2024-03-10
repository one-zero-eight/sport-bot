import type { ChatTypeContext, Context } from 'grammy'

export function pm<C extends Context>(ctx: C): ctx is ChatTypeContext<C, 'private'> {
  return ctx.chat?.type === 'private'
}
