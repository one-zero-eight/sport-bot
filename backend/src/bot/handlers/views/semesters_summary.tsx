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
        <b>Semesters history</b>
        <br />
        <br />
        {semesters.map(({ title, hoursTotal, fitnessTest }) => (
          <>
            {ctx.t.BeautifulSemesterTitle(title)}
            <br />
            {(hoursTotal != null) && (
              <>
                {`• ${hoursTotal} hours`}
                <br />
              </>
            )}
            {fitnessTest && (
              <>
                {`• Fitness test: ${fitnessTest.pointsTotal} points (${fitnessTest.passed ? 'passed' : 'not passed'})`}
                <br />
              </>
            )}
            <br />
          </>
        ))}
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
