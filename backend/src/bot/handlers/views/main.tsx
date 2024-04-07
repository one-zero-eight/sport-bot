import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'

const VIEW_ID = 'main'

const SettingsButton = makeButton({ id: `${VIEW_ID}:settings` })
const TrainingsButton = makeButton({ id: `${VIEW_ID}:trainings` })
const SemestersButton = makeButton({ id: `${VIEW_ID}:semesters` })

export default {
  render: async ctx => (
    <>
      {ctx.t['Views.Main.Message']}
      <keyboard>
        <TrainingsButton>{ctx.t['Views.Main.Buttons.Trainings']}</TrainingsButton>
        <SemestersButton>{ctx.t['Views.Main.Buttons.Semesters']}</SemestersButton>
        <br />
        <button url="https://innohassle.ru/sport">{ctx.t['Views.Main.Buttons.Calendar']}</button>
        <button url="https://sport.innopolis.university">{ctx.t['Views.Main.Buttons.Website']}</button>
        <br />
        <SettingsButton>{ctx.t['Views.Main.Buttons.Settings']}</SettingsButton>
      </keyboard>
    </>
  ),
  middleware: () => {
    const composer = new Composer<Ctx>()

    composer
      .filter(SettingsButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.settings.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    composer
      .filter(TrainingsButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.trainingsDaysList.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    composer
      .filter(SemestersButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .to(await views.semestersSummary.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
