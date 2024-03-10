import { autoRetry } from '@grammyjs/auto-retry'
import type { InstallFn } from '.'

export const install: InstallFn = (bot) => {
  bot.api.config.use(autoRetry())
}
