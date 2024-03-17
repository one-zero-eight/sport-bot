import type { Context } from 'grammy'
import type { LoggingFlavor } from './plugins/logging'
import type { TranslationsFlavor } from './plugins/translations'
import type { DomainFlavor } from './plugins/domain'
import type { MessageSendingFlavor } from './plugins/message-sending'

export type Ctx =
  & Context
  & LoggingFlavor
  & DomainFlavor
  & TranslationsFlavor
  & MessageSendingFlavor
