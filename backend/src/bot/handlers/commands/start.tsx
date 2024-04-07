import views from '~/bot/handlers/views'
import { handler } from '~/bot/handlers'
import filters from '~/bot/filters'
import { TelegramNotLinkedToInnohassleAccountError } from '~/domain/errors'
import { InnohassleLoginButton } from '~/bot/login-button'

export default handler((composer) => {
  composer
    .command('start')
    .filter(filters.pm)
    .use(async (ctx) => {
      let authorized
      try {
        authorized = await ctx.domain.isUserAuthorized(ctx.from.id)
      } catch (error) {
        authorized = false
        if (error instanceof TelegramNotLinkedToInnohassleAccountError) {
          // ignore
        } else {
          ctx.logger.error({
            msg: 'failed to check whether user is authorized',
            error: error,
          })
        }
      }

      let content
      if (authorized) {
        content = await views.main.render(ctx, {})
      } else {
        content = (
          <>
            {ctx.t['WelcomeMessage.Unauthorized']}
            <keyboard>
              <InnohassleLoginButton
                loginUrl={ctx.config.innohassle.telegramLoginUrl}
                loginBotUsername={ctx.config.innohassle.telegramBotUsername}
                returnBotUsername={ctx.me.username}
              >
                {ctx.t['Buttons.LoginWithInnohassle']}
              </InnohassleLoginButton>
            </keyboard>
          </>
        )
      }

      await ctx.send(content).to(ctx.chat.id)
    })
})
