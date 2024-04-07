import commands from './commands'
import views from './views'
import { handler } from '.'
import { TelegramNotLinkedToInnohassleAccountError } from '~/domain/errors'
import { InnohassleLoginButton } from '~/bot/login-button'

export default handler((composer) => {
  composer = composer.errorBoundary(async (err) => {
    if (err.error instanceof TelegramNotLinkedToInnohassleAccountError) {
      const ctx = err.ctx
      await ctx
        .send(
          <InnohassleLoginButton
            loginUrl={ctx.config.innohassle.telegramLoginUrl}
            loginBotUsername={ctx.config.innohassle.telegramBotUsername}
            returnBotUsername={ctx.me.username}
          >
            {ctx.t['Buttons.LoginWithInnohassle']}
          </InnohassleLoginButton>,
        )
        .to(ctx.chat!.id)
    } else {
      throw err.error
    }
  })

  composer.use(views.main)
  composer.use(views.settings)
  composer.use(views.settingsLanguage)
  composer.use(views.trainingsDaysList)
  composer.use(views.trainingsDayTrainings)
  composer.use(views.trainingsTraining)
  composer.use(views.semestersSummary)

  composer.use(commands.start)
  composer.use(commands.howgoodami)
})
