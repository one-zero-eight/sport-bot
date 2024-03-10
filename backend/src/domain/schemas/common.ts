import { z } from 'zod'

export const Language = z.string().regex(/^[a-z]{2}$/)
export type Language = z.infer<typeof Language>
