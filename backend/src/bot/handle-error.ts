import type { ErrorHandler } from 'grammy'
import { GrammyError, HttpError } from 'grammy'
import type { Ctx } from './context'

/**
 * @see https://grammy.dev/guide/errors
 */
export const handleError: ErrorHandler<Ctx> = (error) => {
  let msg
  if (error instanceof GrammyError) {
    msg = 'Bot API request failed'
  } else if (error instanceof HttpError) {
    msg = 'network error'
  } else {
    msg = 'error in middleware'
  }
  error.ctx.logger.error({ msg, error })
}
