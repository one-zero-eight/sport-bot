import { z } from 'zod'
import { Language } from './common'
import { NotificationPreferences } from './notifications'

export const User = z.object({
  telegramId: z.coerce.number().int(),
  createdAt: z.date(),
  username: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  language: Language.nullable(),
  notificationPreferences: NotificationPreferences,
})
export type User = z.infer<typeof User>
