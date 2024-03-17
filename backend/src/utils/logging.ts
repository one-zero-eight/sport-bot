import type { LogFn, Level as PinoLevel, Logger as PinoLogger } from 'pino'
import { pino } from 'pino'

export type Level = PinoLevel
export type Logger = PinoLogger

export function createLogger(options?: {
  level?: Level
  pretty?: boolean
}): Logger {
  const {
    level = 'info',
    pretty = false,
  } = options ?? {}

  const logger = pino({
    level,
    ...(
      pretty
        ? { transport: { target: 'pino-pretty' } }
        : {}
    ),
  })

  return logger
}

export function getLogFn(logger: Logger, level: Level): LogFn {
  return logger[level].bind(logger)
}
