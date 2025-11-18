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

  telegramProxyUrl: z
    .string()
    .describe('HTTP proxy URL for requests to Telegram Bot API.\n\nExample: "http://user:password@host:port"'),

  sport: z.object({
    apiBaseUrl: z
      .string()
      .describe('InnoSport API base URL.\n\nExample: "https://sport.innopolis.university/api".'),
  }),

  innohassle: z.object({
    apiBaseUrl: z
      .string()
      .describe('InNoHassle Accounts API base URL.\n\nExample: "https://api.innohassle.ru/accounts/v0".'),

    token: z
      .string()
      .describe('InNoHassle Accounts API service token.\n\nExample: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9".'),

    telegramLoginUrl: z
      .string()
      .describe('URL for linking a Telegram account to an InNoHassle account.\n\nExample: "https://innohassle.ru/account/connect-telegram".'),

    telegramBotUsername: z
      .string()
      .describe('Username of the InNoHassle Accounts bot in Telegram.'),
  }),
})
export type Config = z.infer<typeof Config>
