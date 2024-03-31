import type { ErrorHandler } from 'grammy'
import { BotError, GrammyError, HttpError } from 'grammy'
import type { Ctx } from './context'

/**
 * @see https://grammy.dev/guide/errors
 */
export const handleError: ErrorHandler<Ctx> = (e) => {
  const error = e.error
  const ctx = e.ctx
  let msg
  if (error instanceof GrammyError) {
    msg = 'Bot API request failed'
  } else if (error instanceof HttpError) {
    msg = 'network error'
  } else if (error instanceof BotError) {
    msg = 'error in middleware'
  }
  ctx.logger.error({
    msg: msg,
    update: ctx.update,
    error: error,
  })
}
