import type { DomainFlavor } from './domain'
import type { InstallFn } from '.'
import type { Translation } from '~/translations'
import translations from '~/translations'

export type TranslationsFlavor = {
  t: Translation
  renegotiateTranslation: (language?: keyof typeof translations) => void
}

export const install: InstallFn<TranslationsFlavor & DomainFlavor> = (bot) => {
  const getTranslationOrDefault = (language: string) => (
    translations[language as keyof typeof translations]
    || translations.en
  )

  bot.use((ctx, next) => {
    ctx.renegotiateTranslation = (language) => {
      if (language) {
        ctx.t = getTranslationOrDefault(language)
      } else if (ctx.user?.language) {
        ctx.t = getTranslationOrDefault(ctx.user.language)
      } else if (ctx.from?.language_code) {
        ctx.t = getTranslationOrDefault(ctx.from.language_code)
      } else {
        ctx.t = translations.en
      }
    }
    ctx.renegotiateTranslation()

    return next()
  })
}
