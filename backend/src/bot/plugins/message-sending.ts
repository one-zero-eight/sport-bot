import type { MessagesFlavor } from '@telegum/grammy-messages'
import { messages } from '@telegum/grammy-messages'
import type { InstallFn } from '.'

export const install: InstallFn<MessagesFlavor> = (bot) => {
  bot.use(messages)
}
