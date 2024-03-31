import { z } from 'zod'
import { ApiClient } from '~/utils/api-client'
import type { Logger } from '~/utils/logging'

export class InnohassleClient extends ApiClient {
  constructor({
    logger,
    baseUrl,
    token,
  }: {
    logger: Logger
    baseUrl: string
    token: string
  }) {
    super({
      logger: logger,
      axiosOptions: {
        baseURL: baseUrl,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })
  }

  public async generateSportTokenForUser({
    telegramId,
  }: {
    telegramId: number
  }) {
    const response = await this.request({
      method: 'GET',
      path: '/tokens/generate-sport-token',
      queryParams: { telegram_id: telegramId },
      responseSchema: z.object({ access_token: z.string() }),
    })
    return response.access_token
  }
}
