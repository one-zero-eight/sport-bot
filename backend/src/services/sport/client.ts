import { z } from 'zod'
import type { TrainingDetailed, TrainingInfo } from './types'
import { CalendarTraining, FitnessTestResult, SemesterSportHoursInfo, Training } from './schemas'
import type { Logger } from '~/utils/logging'
import { ApiClient } from '~/utils/api-client'

/**
 * InnoSport API client implementation.
 *
 * @see https://sugar-slash-7c8.notion.site/Sport-API-9e021517b5664582ae72cd22e02f4cb6
 */
export class SportClient extends ApiClient {
  private studentId: number

  constructor({
    logger,
    baseUrl,
  }: {
    logger: Logger
    baseUrl: string
  }) {
    super({
      logger: logger,
      axiosOptions: { baseURL: baseUrl },
    })
    this.studentId = -1
  }

  public setToken(accessToken: string) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`
  }

  public setStudentId(studentId: number) {
    this.studentId = studentId
  }

  public getMe() {
    return this.request({
      method: 'GET',
      path: '/profile/student',
      responseSchema: z.object({
        id: z.coerce.number(),
        name: z.string(),
        email: z.string(),
        medical_group: z.string(),
      }),
    })
  }

  public async getAllSemesters() {
    return await this.request({
      method: 'GET',
      path: '/semester',
      responseSchema: z.array(z.object({
        id: z.number(),
        name: z.string(),
      })),
    })
  }

  public getSportHoursInfo() {
    return this.request({
      method: 'GET',
      path: `/attendance/${this.studentId}/hours`,
      responseSchema: z.object({
        ongoing_semester: SemesterSportHoursInfo,
        last_semesters_hours: z.array(SemesterSportHoursInfo),
      }),
    })
  }

  public getBetterThanPercent() {
    return this.request({
      method: 'GET',
      path: `/attendance/${this.studentId}/better_than`,
      responseSchema: z.number(),
    })
  }

  public async getTrainings({
    from,
    to,
  }: {
    from: Date
    to: Date
  }): Promise<TrainingInfo[]> {
    const rawTrainings = await this.request({
      method: 'GET',
      path: '/calendar/trainings',
      queryParams: {
        start: from.toISOString(),
        end: to.toISOString(),
      },
      responseSchema: z.array(CalendarTraining),
    })
    return rawTrainings.map(t => ({
      id: t.extendedProps.id,
      title: t.title,
      startsAt: t.start,
      endsAt: t.end,
      checkedIn: t.extendedProps.checked_in ?? false,
      checkInAvailable: t.extendedProps.can_check_in ?? false,
    }))
  }

  public async getTraining(trainingId: number): Promise<TrainingDetailed> {
    const raw = await this.request({
      method: 'GET',
      path: `/training/${trainingId}`,
      responseSchema: Training,
    })
    return {
      id: raw.training.id,
      title: raw.training.custom_name ?? raw.training.group.name,
      startsAt: raw.training.start,
      endsAt: raw.training.end,
      description: raw.training.group.sport.description,
      accredited: raw.training.group.accredited,
      checkedIn: raw.checked_in ?? false,
      checkInAvailable: raw.can_check_in ?? false,
      location: raw.training.place,
      teachers: raw.training.group.teachers.map(t => ({
        id: t.id,
        firstName: t.first_name,
        lastName: t.last_name,
        email: t.email,
      })),
    }
  }

  public async checkInForTraining(trainingId: number): Promise<void> {
    await this.request({
      method: 'POST',
      path: `/training/${trainingId}/check_in`,
      responseSchema: z.any(),
    })
  }

  public async cancelCheckInForTraining(trainingId: number): Promise<void> {
    await this.request({
      method: 'POST',
      path: `/training/${trainingId}/cancel_check_in`,
      responseSchema: z.any(),
    })
  }

  public getTrainingsHistoryForSemester(semesterId: number) {
    return this.request({
      method: 'GET',
      path: `/profile/history_with_self/${semesterId}`,
      responseSchema: z.object({
        trainings: z.array(z.object({
          hours: z.number(),
          group: z.string(),
          group_id: z.number(),
          custom_name: z.string().nullable(),
          timestamp: z.string(),
          approved: z.boolean(),
        })),
      }),
    })
  }

  public getAllFitnessTestResults() {
    return this.request({
      method: 'GET',
      path: '/fitnesstest/result',
      responseSchema: z.array(FitnessTestResult),
    })
  }
}
