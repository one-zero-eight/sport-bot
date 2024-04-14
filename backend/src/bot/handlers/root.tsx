import commands from './commands'
import views from './views'
import fallbackCallbackQueryHandler from './fallback-callback-query'
import { handler } from '.'
import { TelegramNotLinkedToInnohassleAccountError } from '~/domain/errors'
import { InnohassleLoginButton } from '~/bot/login-button'

export default handler((composer) => {
  composer = composer.errorBoundary(async (err) => {
    if (err.error instanceof TelegramNotLinkedToInnohassleAccountError) {
      const ctx = err.ctx
      await ctx
        .send(
          <>
            {ctx.t['Messages.LoginRequired']}
            <keyboard>
              <InnohassleLoginButton
                loginUrl={ctx.config.innohassle.telegramLoginUrl}
                loginBotUsername={ctx.config.innohassle.telegramBotUsername}
                returnBotUsername={ctx.me.username}
              >
                {ctx.t['Buttons.LoginWithInnohassle']}
              </InnohassleLoginButton>
            </keyboard>
          </>,
        )
        .to(ctx.chat?.id ?? ctx.from!.id)
    } else {
      throw err.error
    }
  })

  composer.use(views.main)
  composer.use(views.training)
  composer.use(views.trainings)
  composer.use(views.semestersSummary)

  composer.use(commands.start)
  composer.use(commands.menu)
  composer.use(commands.help)
  composer.use(commands.howgoodami)

  composer.use(fallbackCallbackQueryHandler)
})
