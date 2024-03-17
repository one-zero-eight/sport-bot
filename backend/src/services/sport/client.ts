import axios from 'axios'
import { z } from 'zod'
import type { AxiosInstance } from 'axios'
import type { TrainingDetailed, TrainingInfo } from './types'
import { CalendarTraining, Training } from './schemas'
import type { Logger } from '~/utils/logging'

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
          config: config,
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

  public async getBetterThan({ studentId }: { studentId: number }) {
    return this.request({
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
