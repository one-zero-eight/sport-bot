import type { InstallFn } from '.'
import type { User } from '~/domain/schemas/user'
import type { Domain } from '~/domain'

export type DomainOptions = {
  domain: Domain
}

export type DomainFlavor = {
  domain: Domain
  user?: User
}

export const install: InstallFn<DomainFlavor, DomainOptions> = (bot, { domain }) => {
  bot.use(async (ctx, next) => {
    ctx.domain = domain
    if (ctx.from) {
      ctx.user = await domain.upsertUser({
        telegramId: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        notificationPreferences: { classes: [] },
      })
    }
    return next()
  })
}
