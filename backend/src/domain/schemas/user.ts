import { z } from 'zod'
import { Language } from './common'

export const User = z.object({
  telegramId: z.coerce.number().int(),
  createdAt: z.date(),
  username: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  language: Language.nullable(),
})
export type User = z.infer<typeof User>
