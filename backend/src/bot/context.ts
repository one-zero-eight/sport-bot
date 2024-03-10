import type { Context } from 'grammy'
import type { LoggingFlavor } from './plugins/logging'
import type { TranslationsFlavor } from './plugins/translations'

export type Ctx =
  & Context
  & LoggingFlavor
  & TranslationsFlavor
