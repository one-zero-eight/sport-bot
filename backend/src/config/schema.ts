import { z } from 'zod'

export const Config = z.object({
  environment: z
    .enum(['development', 'production'])
    .describe('Application environment.\n\nPossible values: "development", "production".'),

  postgresUrl: z
    .string()
    .describe('Postgres database connection URI.\n\nExample: "postgresql://USER:PASSWORD@HOST:PORT/DATABASE".'),

  bot: z.object({
    token: z
      .string()
      .describe('Telegram Bot API token.\n\nExample: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11".'),
  }),
})
export type Config = z.infer<typeof Config>
