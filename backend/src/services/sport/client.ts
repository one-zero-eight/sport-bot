import axios from 'axios'
import { z } from 'zod'
import type { AxiosInstance } from 'axios'
import type { TrainingDetailed, TrainingInfo } from './types'
import { CalendarTraining, Training } from './schemas'
import type { Logger } from '~/utils/logging'

/**
 * InnoSport API client implementation.
 *
 * @see https://sugar-slash-7c8.notion.site/Sport-API-9e021517b5664582ae72cd22e02f4cb6
 */
export class SportClient {
  private logger: Logger
  private axios: AxiosInstance

  constructor({
    logger,
    baseUrl,
    token,
  }: {
    logger: Logger
    baseUrl: string
    token: string
  }) {
    const axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug({
          msg: 'API request initiated',
          config: {
            auth: config.auth,
            baseURL: config.baseURL,
            data: config.data,
            headers: config.headers,
            url: config.url,
          },
        })
        return config
      },
    )

    axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug({
          msg: 'API request finished',
          response: response,
        })
        return response
      },
      (error) => {
        logger.error({
          msg: 'API request failed',
          error: error,
        })
        return Promise.reject(error)
      },
    )

    this.logger = logger
    this.axios = axiosInstance
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

  public async getSportHoursInfo({ studentId }: { studentId: number }) {
    const semesterHoursSchema = z.object({
      id_sem: z.number(),
      hours_not_self: z.number(),
      hours_self_not_debt: z.number(),
      hours_self_debt: z.number(),
      hours_sem_max: z.number(),
      debt: z.number(),
    })

    return await this.request({
      method: 'GET',
      path: `/attendance/${studentId}/hours`,
      responseSchema: z.object({
        ongoing_semester: semesterHoursSchema,
        last_semesters_hours: z.array(semesterHoursSchema),
      }),
    })
  }

  public async getBetterThan({ studentId }: { studentId: number }) {
    return await this.request({
      method: 'GET',
      path: `/attendance/${studentId}/better_than`,
      responseSchema: z.number(),
    })
  }

  public async getTrainings({
    studentId: _, // @todo Use student ID in authorization.
    from,
    to,
  }: {
    studentId: number
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
      checkedIn: t.extendedProps.checked_in,
      checkInAvailable: t.extendedProps.can_check_in,
    }))
  }

  public async getTraining({
    studentId: _, // @todo Use student ID in authorization.
    trainingId,
  }: {
    studentId: number
    trainingId: number
  }): Promise<TrainingDetailed> {
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
      checkedIn: raw.checked_in,
      checkInAvailable: raw.can_check_in,
      location: raw.training.place,
      teachers: raw.training.group.teachers.map(t => ({
        id: t.id,
        firstName: t.first_name,
        lastName: t.last_name,
        email: t.email,
      })),
    }
  }

  public async checkInForTraining({
    studentId: _, // @todo Use student ID in authorization.
    trainingId,
  }: {
    studentId: number
    trainingId: number
  }): Promise<void> {
    await this.request({
      method: 'POST',
      path: `/training/${trainingId}/check_in`,
      responseSchema: z.any(),
    })
  }

  public async cancelCheckInForTraining({
    studentId: _, // @todo Use student ID in authorization.
    trainingId,
  }: {
    studentId: number
    trainingId: number
  }): Promise<void> {
    await this.request({
      method: 'POST',
      path: `/training/${trainingId}/cancel_check_in`,
      responseSchema: z.any(),
    })
  }

  public async getTrainingsHistoryForSemester({
    studentId: _, // @todo Use student ID in authorization.
    semesterId,
  }: {
    studentId: number
    semesterId: number
  }) {
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

  public async getAllFitnessTestResults({
    studentId: _, // @todo Use student ID in authorization.
  }: {
    studentId: number
  }) {
    return this.request({
      method: 'GET',
      path: '/fitnesstest/result',
      responseSchema: z.array(z.object({
        semester: z.string(),
        retake: z.boolean(),
        grade: z.number(),
        total_score: z.number(),
        details: z.array(z.object({
          exercise: z.string(),
          unit: z.string(),
          value: z.union([z.string(), z.number()]),
          score: z.number(),
          max_score: z.number(),
        })),
      })),
    })
  }

  private async request<S extends z.ZodSchema>({
    method,
    path,
    responseSchema,
    queryParams,
    data,
  }: {
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
    path: string
    responseSchema: S
    queryParams?: any
    data?: any
  }): Promise<z.infer<S>> {
    const response = await this.axios.request({
      method: method,
      url: path,
      data: data,
      params: queryParams,
    })
    return responseSchema.parse(response.data)
  }
}
