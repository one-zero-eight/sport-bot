import { parseMode } from '@grammyjs/parse-mode'
import type { InstallFn } from '.'

export type ParseModeOptions = {
  parseMode: 'MarkdownV2' | 'HTML'
}

// eslint-disable-next-line ts/ban-types
export const install: InstallFn<{}, ParseModeOptions> = (
  bot,
  { parseMode: parseModeName },
) => {
  bot.api.config.use(parseMode(parseModeName))
}
