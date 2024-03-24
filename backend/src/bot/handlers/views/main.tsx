import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'

const VIEW_ID = 'main'

const SettingsButton = makeButton({ id: `${VIEW_ID}:settings` })
const TrainingsButton = makeButton({ id: `${VIEW_ID}:trainings` })

export default {
  render: async ctx => (
    <>
      {ctx.t['Views.Main.Message']}
      <keyboard>
        <SettingsButton>{ctx.t['Views.Main.Buttons.Settings']}</SettingsButton>
        <TrainingsButton>{ctx.t['Views.Main.Buttons.Trainings']}</TrainingsButton>
      </keyboard>
    </>
  ),
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(SettingsButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.settings.render(ctx, {}))
      })

    composer
      .filter(TrainingsButton.filter)
      .use(async (ctx) => {
        ctx.answerCallbackQuery()
        await ctx
          .edit(ctx.chat!.id, ctx.callbackQuery.message!.message_id)
          .to(await views.trainingsDaysList.render(ctx, {}))
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
