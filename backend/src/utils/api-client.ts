import type { z } from 'zod'
import axios from 'axios'
import type { AxiosError, AxiosInstance } from 'axios'
import type { Logger } from './logging'

export class ApiClient {
  protected logger: Logger
  protected axios: AxiosInstance

  constructor({
    logger,
    axiosOptions,
  }: {
    logger: Logger
    axiosOptions?: Parameters<typeof axios.create>[0]
  }) {
    this.logger = logger
    this.axios = createAxiosWithLogging({
      logger: logger,
      options: axiosOptions,
    })
  }

  protected async request<S extends z.ZodSchema>(options: (
    & Omit<Parameters<typeof axios.request>[0], 'method' | 'url' | 'params'>
    & {
      method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
      path: string
      queryParams?: any
      responseSchema: S
    }
  )): Promise<z.infer<S>> {
    const {
      responseSchema,
      path,
      queryParams,
      ...rest
    } = options

    let response

    try {
      response = await this.axios.request({
        url: path,
        params: queryParams,
        ...rest,
      })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new RequestFailedError(err)
      }
      throw err
    }

    return responseSchema.parse(response.data)
  }
}

function createAxiosWithLogging({
  logger,
  options,
}: {
  logger: Logger
  options?: Parameters<typeof axios.create>[0]
}): AxiosInstance {
  const instance = axios.create(options)

  instance.interceptors.request.use(
    (config) => {
      logger.debug({
        msg: 'API request initiated',
        config: {
          baseURL: config.baseURL,
          data: config.data,
          url: config.url,
          params: config.params,
        },
      })
      return config
    },
  )

  instance.interceptors.response.use(
    (response) => {
      logger.debug({
        msg: 'API request finished',
        response: {
          data: response.data,
          status: response.status,
        },
      })
      return response
    },
  )

  return instance
}

export class RequestFailedError extends Error {
  status: number | undefined
  axiosError: AxiosError

  constructor(axiosError: AxiosError) {
    super(axiosError.message, { cause: axiosError })
    this.name = 'RequestFailedError'
    this.status = axiosError.status
    this.axiosError = axiosError
  }
}
