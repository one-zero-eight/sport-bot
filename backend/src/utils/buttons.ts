import type { Context, Filter } from 'grammy'

export class Button<P = null> {
  #id: string
  #encodePayload: (payload: P) => string
  #decodePayload: (data: string) => P

  constructor({
    id,
    payloadEncoder,
    payloadDecoder,
  }: {
    id: string
    payloadEncoder: (payload: P) => string
    payloadDecoder: (data: string) => P
  }) {
    this.#id = id
    this.#encodePayload = payloadEncoder
    this.#decodePayload = payloadDecoder
  }

  public get filter() {
    return <C extends Context>(ctx: C): ctx is (Filter<C, 'callback_query:data'> & { payload: P }) => {
      const data = ctx.callbackQuery?.data
      if (data !== undefined) {
        const parseResult = this.parseCallbackData(data)
        if (parseResult.ok) {
          (ctx as C & { payload: P }).payload = parseResult.payload
          return true
        }
      }
      return false
    }
  }

  public createCallbackData(payload: P): string {
    return `${this.callbackDataPrefix}${this.#encodePayload(payload)}`
  }

  private parseCallbackData(data: string): { ok: false } | { ok: true, payload: P } {
    if (!data.startsWith(this.callbackDataPrefix)) {
      return { ok: false }
    }
    const payloadEncoded = data.slice(this.callbackDataPrefix.length)
    return {
      ok: true,
      payload: this.#decodePayload(payloadEncoded),
    }
  }

  private get callbackDataPrefix(): string {
    return `${this.#id}:`
  }
}
