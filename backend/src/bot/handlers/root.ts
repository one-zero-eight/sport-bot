import { InlineKeyboard } from 'grammy'
import commands from './commands'
import views from './views'
import { handler } from '.'
import { TelegramNotLinkedToInnohassleAccountError } from '~/domain/errors'

export default handler((composer) => {
  composer = composer.errorBoundary(async (err) => {
    if (err.error instanceof TelegramNotLinkedToInnohassleAccountError) {
      const ctx = err.ctx
      const loginUrl = new URL(ctx.config.innohassle.telegramLoginUrl)
      loginUrl.searchParams.set('bot', `${ctx.me.username}?start=_`)
      await ctx.reply(ctx.t['InNoHassle.LinkAccountsRequest.Message'], {
        reply_markup: new InlineKeyboard([[
          {
            text: ctx.t['InNoHassle.LinkAccountsRequest.Button'],
            login_url: {
              url: loginUrl.toString(),
              bot_username: ctx.config.innohassle.telegramBotUsername,
              forward_text: ctx.t['InNoHassle.LinkAccountsRequest.ForwardText'],
            },
          },
        ]]),
      })
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
