import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'

const VIEW_ID = 'semesters/summary'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })

export default {
  render: async (ctx) => {
    const semesters = await ctx.domain.getSemestersSummary({ telegramId: ctx.from!.id })
    return (
      <>
        {ctx.t['Views.SemestersSummary.SummaryMessage'](semesters)}
        <keyboard>
          <BackButton>{ctx.t['Buttons.Back']}</BackButton>
        </keyboard>
      </>
    )
  },
  middleware: () => {
    const composer = new Composer<Ctx>()

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
} satisfies View<Ctx> as View<Ctx>
