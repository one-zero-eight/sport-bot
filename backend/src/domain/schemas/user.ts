import { z } from 'zod'

export const User = z.object({
  telegramId: z.coerce.number().int(),
  createdAt: z.date(),
  username: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  favoriteGroupIds: z.array(z.number()),
})
export type User = z.infer<typeof User>
