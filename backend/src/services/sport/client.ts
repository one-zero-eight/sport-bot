import axios from 'axios'
import { z } from 'zod'
import type { AxiosInstance } from 'axios'
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
          msg: 'YooKassa API request failed',
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

  private async request<S extends z.ZodSchema>({
    method,
    path,
    responseSchema,
    data,
  }: {
    method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
    path: string
    responseSchema: S
    data?: any
  }): Promise<z.infer<S>> {
    const response = await this.axios.request({
      method: method,
      url: path,
      data: data,
    })
    return responseSchema.parse(response.data)
  }
}
