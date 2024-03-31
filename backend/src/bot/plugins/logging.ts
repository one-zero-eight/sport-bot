import type { InstallFn } from '.'
import { type Level, type Logger, getLogFn } from '~/utils/logging'

export type LoggingOptions = {
  logger: Logger
  logUpdates?: boolean | {
    level: Level
  }
  logApiCalls?: boolean | {
    level: Level
  }
}

export type LoggingFlavor = {
  logger: Logger
}

export const install: InstallFn<LoggingFlavor, LoggingOptions> = (bot, options) => {
  const {
    logger,
    logUpdates = true,
    logApiCalls = true,
  } = options

  bot.use((ctx, next) => {
    ctx.logger = logger
    return next()
  })

  if (logUpdates) {
    const level = typeof logUpdates === 'object' ? logUpdates.level : 'debug'
    const log = getLogFn(logger, level)
    bot.use(async (ctx, next) => {
      log({
        msg: 'updated received',
        updateId: ctx.update.update_id,
        update: ctx.update,
      })

      const t1 = performance.now()
      await next()
      const t2 = performance.now()

      log({
        msg: 'update processed',
        updateId: ctx.update.update_id,
        durationMs: Math.round(t2 - t1),
      })
    })
  }

  if (logApiCalls) {
    const level = typeof logApiCalls === 'object' ? logApiCalls.level : 'debug'
    const log = getLogFn(logger, level)
    bot.api.config.use(async (prev, method, payload, signal) => {
      log({
        msg: 'Telegram API call initiated',
        method: method,
        payload: payload,
      })

      const t1 = performance.now()
      const result = await prev(method, payload, signal)
      const t2 = performance.now()

      log({
        msg: 'Telegram API call completed',
        method: method,
        result: result,
        durationMs: Math.round(t2 - t1),
      })

      return result
    })
  }
}
