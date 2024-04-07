import { Composer } from 'grammy'
import { makeButton } from '@telegum/grammy-buttons'
import type { View } from '.'
import views from '.'
import type { Ctx } from '~/bot/context'
import { Table } from '~/bot/utils/table'

const VIEW_ID = 'semesters/summary'

const BackButton = makeButton({ id: `${VIEW_ID}:back` })

export default {
  render: async (ctx) => {
    const summary = await ctx.domain.getSemestersSummary({ telegramId: ctx.from!.id })

    const rows = [
      ['Semester', 'Hours', 'Test'],
      ...summary.map(({ title, hoursTotal, fitnessTest }) => [
        title.length > 8
          ? `${title.slice(0, 6)}...`
          : title,
        hoursTotal.toString(),
      `${fitnessTest.passed ? '✔' : '✘'} ${fitnessTest.pointsTotal}%`,
      ]),
    ]

    return (
      <>
        <Table rows={rows} headingRow />
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
          .to(await views.main.render(ctx, {}))
        ctx.answerCallbackQuery()
      })

    return composer.middleware()
  },
} satisfies View<Ctx> as View<Ctx>
