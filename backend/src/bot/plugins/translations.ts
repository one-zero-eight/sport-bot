import type { DomainFlavor } from './domain'
import type { InstallFn } from '.'
import type { Language, Translation } from '~/translations'
import translations from '~/translations'

export type TranslationsFlavor = {
  t: Translation
}

export const install: InstallFn<TranslationsFlavor & DomainFlavor> = (bot) => {
  bot.use((ctx, next) => {
    ctx.t = translations[ctx.user?.language as Language] ?? translations.en
    return next()
  })
}
