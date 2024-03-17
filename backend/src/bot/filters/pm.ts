import type { ChatTypeContext } from 'grammy'
import type { Ctx } from '~/bot/context'
import type { User } from '~/domain/schemas/user'

export default function pm<C extends Ctx>(ctx: C): ctx is (ChatTypeContext<C, 'private'> & { user: User }) {
  return ctx.chat?.type === 'private' && ctx.user != null
}
