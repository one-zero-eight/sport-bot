import { makeButton } from '@telegum/grammy-buttons'
import views from '.'
import { makeView } from '~/bot/utils/view'

const VIEW_ID = 'main'

const RefreshButton = makeButton({ id: `${VIEW_ID}:refresh` })
const MyTrainingsButton = makeButton({ id: `${VIEW_ID}:my-trainings` })
const AllTrainingsButton = makeButton({ id: `${VIEW_ID}:all-trainings` })
const SemestersButton = makeButton({ id: `${VIEW_ID}:semesters` })

export default makeView({
  render: async ctx => (
    <>
      {ctx.t['Views.Main.Message'](await ctx.domain.getOngoingSemesterHoursForUser(ctx.from!.id))}
      <keyboard>
        <RefreshButton>{ctx.t['Views.Main.Buttons.Refresh']}</RefreshButton>
        <br />
        <MyTrainingsButton>{ctx.t['Views.Main.Buttons.TrainingsMy']}</MyTrainingsButton>
        <AllTrainingsButton>{ctx.t['Views.Main.Buttons.TrainingsAll']}</AllTrainingsButton>
        <br />
        <SemestersButton>{ctx.t['Views.Main.Buttons.Semesters']}</SemestersButton>
        <br />
        <button url="https://innohassle.ru/sport">{ctx.t['Views.Main.Buttons.Calendar']}</button>
        <br />
        <button url="https://sport.innopolis.university">{ctx.t['Views.Main.Buttons.Website']}</button>
      </keyboard>
    </>
  ),
  setup: (composer) => {
    composer
      .filter(RefreshButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.main.render(ctx, {}))
        await ctx.answerCallbackQuery(ctx.t['Views.Main.Alerts.Refreshed'])
      })

    composer
      .filter(MyTrainingsButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.trainings.render(ctx, { tab: { type: 'my' } }))
        await ctx.answerCallbackQuery()
      })

    composer
      .filter(AllTrainingsButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.trainings.render(ctx, { tab: { type: 'all' } }))
        await ctx.answerCallbackQuery()
      })

    composer
      .filter(SemestersButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.semestersSummary.render(ctx, {}))
        await ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
})
