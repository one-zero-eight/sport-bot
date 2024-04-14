import { Composer } from 'grammy'
import type { Context, MiddlewareFn } from 'grammy'
import type { TgxElement } from '@telegum/tgx'
import type { Ctx } from '~/bot/context'

// eslint-disable-next-line ts/ban-types
export type RenderFn<C extends Context, P extends {}> = (
  ctx: C,
  props: P,
) => Promise<TgxElement>

// eslint-disable-next-line ts/ban-types
export type View<C extends Context, P extends {}> = {
  render: RenderFn<C, P>
  middleware: () => MiddlewareFn<C>
}

// eslint-disable-next-line ts/ban-types
export function makeView<P extends {} = {}, C extends Context = Ctx>({
  render,
  setup = () => void 0,
}: {
  render: RenderFn<C, P>
  setup?: (
    composer: Composer<C>,
    view: View<C, P>
  ) => void
}): View<C, P> {
  const composer = new Composer<C>()

  const view = {
    render: render,
    middleware: () => composer.middleware(),
  }

  setup(composer, view)

  return view
}
