import type { Context } from 'grammy'
import type { LoggingFlavor } from './plugins/logging'
import type { TranslationsFlavor } from './plugins/translations'
import type { DomainFlavor } from './plugins/domain'

export type Ctx =
  & Context
  & LoggingFlavor
  & DomainFlavor
  & TranslationsFlavor
