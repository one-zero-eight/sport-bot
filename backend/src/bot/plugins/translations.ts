import type { InstallFn } from '.'
import type { Translation } from '~/translations'
import translations from '~/translations'

export type TranslationsFlavor = {
  t: Translation
}

export const install: InstallFn<TranslationsFlavor> = (bot) => {
  bot.use((ctx, next) => {
    // @todo Use user's preferred language.
    ctx.t = translations.en
    return next()
  })
}
