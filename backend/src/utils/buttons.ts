import crypto from 'node:crypto'
import type { Context, Filter } from 'grammy'

export class Button<P = null> {
  #id: string
  #encodePayload: (payload: P) => string
  #decodePayload: (data: string) => P

  constructor({
    id,
    payloadEncoder = (_: P) => '',
    payloadDecoder = (_: string) => (null as unknown as P),
  }: {
    id: string | string[]
    payloadEncoder?: (payload: P) => string
    payloadDecoder?: (data: string) => P
  }) {
    this.#id = typeof id === 'string' ? id : id.join('::')
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

  public dataFor(payload: P): string {
    return `${this.prefix}${this.#encodePayload(payload)}`
  }

  private parseCallbackData(data: string): { ok: false } | { ok: true, payload: P } {
    if (!data.startsWith(this.prefix)) {
      return { ok: false }
    }
    const payloadEncoded = data.slice(this.prefix.length)
    return {
      ok: true,
      payload: this.#decodePayload(payloadEncoded),
    }
  }

  private get prefix(): string {
    const idHash = crypto
      .createHash('sha1')
      .update(this.#id)
      .digest('hex')
      .slice(0, 8)
    return `#${idHash}:`
  }
}
