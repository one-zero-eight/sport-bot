import { makeButton } from '@telegum/grammy-buttons'
import views from '.'
import { makeView } from '~/bot/utils/view'

const VIEW_ID = 'semesters/summary'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })

export default makeView({
  render: async (ctx) => {
    const semesters = await ctx.domain.getSemestersSummary(ctx.from!.id)
    return (
      <>
        {ctx.t['Views.SemestersSummary.SummaryMessage'](semesters)}
        <keyboard>
          <BackButton>{ctx.t['Buttons.Back']}</BackButton>
        </keyboard>
      </>
    )
  },
  setup: (composer) => {
    composer
      .filter(BackButton.filter)
      .use(async (ctx) => {
        await ctx
          .edit(ctx.from.id, ctx.msg!.message_id)
          .with({ ignoreNotModifiedError: true })
          .to(await views.main.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
})
