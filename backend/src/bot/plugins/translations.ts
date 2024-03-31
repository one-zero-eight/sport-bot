import type { DomainFlavor } from './domain'
import type { InstallFn } from '.'
import type { Language, Translation } from '~/translations'
import translations from '~/translations'

export type TranslationsFlavor = {
  t: Translation
  updateLanguage: (language?: Language) => void
}

export const install: InstallFn<TranslationsFlavor & DomainFlavor> = (bot) => {
  bot.use((ctx, next) => {
    ctx.updateLanguage = (language) => {
      let translation
      if (language) {
        translation ??= translations[language]
      }
      if (ctx.user?.language) {
        translation ??= translations[ctx.user.language as Language]
      }
      if (ctx.from?.language_code) {
        translation ??= translations[ctx.from.language_code as Language]
      }
      translation ??= translations.en
      ctx.t = translation
    }
    ctx.updateLanguage()

    return next()
  })
}
