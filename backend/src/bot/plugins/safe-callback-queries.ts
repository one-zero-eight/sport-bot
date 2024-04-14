import type { InstallFn } from '.'

export const install: InstallFn = (bot) => {
  bot.api.config.use(async (prev, method, options, signal) => {
    const result = await prev(method, options, signal)

    if (
      method === 'answerCallbackQuery'
      && !result.ok
      && result.error_code === 400
      && result.description.toLowerCase().includes('query is too old')
    ) {
      return { ok: true, result: true } as any
    }

    return result
  })
}
