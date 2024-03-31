import type { InstallFn } from '.'
import type { User } from '~/domain/schemas/user'
import type { Domain } from '~/domain'
import type { Config } from '~/config'

export type DomainOptions = {
  domain: Domain
  config: Config
}

export type DomainFlavor = {
  domain: Domain
  config: Config
  user?: User
}

export const install: InstallFn<DomainFlavor, DomainOptions> = (bot, { domain, config }) => {
  bot.use(async (ctx, next) => {
    ctx.domain = domain
    ctx.config = config
    if (ctx.from) {
      ctx.user = await domain.upsertUser({
        telegramId: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      })
    }
    return next()
  })
}
