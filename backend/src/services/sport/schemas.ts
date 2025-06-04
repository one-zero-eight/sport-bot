import { z } from 'zod'

export const SemesterSportHoursInfo = z.object({
  id_sem: z.number(),
  hours_not_self: z.number(),
  hours_self_not_debt: z.number(),
  hours_self_debt: z.number(),
  hours_sem_max: z.number(),
  debt: z.number(),
})

export const Trainer = z.object({
  trainer_first_name: z.string(),
  trainer_last_name: z.string(),
  trainer_email: z.string().email(),
})

export const Group = z.object({
  group_id: z.number().int(),
  group_name: z.string(),
  capacity: z.number().int(),
  current_load: z.number().int(),
  trainers: z.array(Trainer),
  is_enrolled: z.boolean(),
  can_enroll: z.boolean(),
})

export const FitnessTestExerciseResult = z.object({
  exercise: z.string(),
  unit: z.string().nullable(),
  value: z.union([z.number(), z.string()]),
  score: z.number(),
  max_score: z.number(),
})

export const FitnessTestResult = z.object({
  semester: z.string(),
  retake: z.boolean(),
  grade: z.boolean(),
  total_score: z.number(),
  details: z.array(FitnessTestExerciseResult),
})

export const CalendarTraining = z.object({
  title: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  allDay: z.boolean(),
  extendedProps: z.object({
    id: z.number(),
    group_id: z.number(),
    group_accredited: z.boolean(),
    training_class: z.string().nullable(), // Place
    can_check_in: z.boolean().optional(),
    checked_in: z.boolean().optional(),
  }),
})

export const Training = z.object({
  can_check_in: z.boolean().optional(),
  checked_in: z.boolean().optional(),
  hours: z.number().nullable(),
  training: z.object({
    id: z.number(),
    custom_name: z.string().nullable(),
    place: z.string().nullable(),
    load: z.number(),
    start: z.coerce.date(),
    end: z.coerce.date(),
    group: z.object({
      id: z.number(),
      name: z.string(),
      capacity: z.number(),
      is_club: z.boolean(),
      accredited: z.boolean(),
      sport: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string(),
      }),
      semester: z.object({
        id: z.number(),
        name: z.string(),
      }),
      teachers: z.array(z.object({
        id: z.number(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
      })),
    }),
  }),
})
