import { z } from 'zod'

export const ClassesNotificationPreferenceSpecificTime = z.object({
  type: z.literal('specific-time'),
  daysBefore: z.number().int(),
  time: z.object({
    hours: z.number().int(),
    minutes: z.number().int(),
  }),
})
export type ClassesNotificationPreferenceSpecificTime = z.infer<typeof ClassesNotificationPreferenceSpecificTime>

export const ClassesNotificationPreferenceRelative = z.object({
  type: z.literal('relative'),
  minutesBefore: z.number().int(),
})
export type ClassesNotificationPreferenceRelative = z.infer<typeof ClassesNotificationPreferenceRelative>

export const ClassesNotificationPreference = z.union([
  ClassesNotificationPreferenceSpecificTime,
  ClassesNotificationPreferenceRelative,
])
export type ClassesNotificationPreference = z.infer<typeof ClassesNotificationPreference>

export const NotificationPreferences = z.object({
  classes: z.array(ClassesNotificationPreference),
})
export type NotificationPreferences = z.infer<typeof NotificationPreferences>
