import { AxiosError } from 'axios'
import { User } from './schemas'
import type { SemesterSummary } from './types'
import { TelegramNotLinkedToInnohassleAccountError } from './errors'
import type { Logger } from '~/utils/logging'
import type { Database } from '~/services/database'
import type { SportClient } from '~/services/sport'
import type { InnohassleClient } from '~/services/innohassle'

export class Domain {
  private logger: Logger
  private db: Database
  private sport: SportClient
  private innohassle: InnohassleClient

  /**
   * Cache of sport users' information, where key is a Telegram ID.
   */
  private sportUsersCache: Map<number, UserSportInfo>

  constructor(options: {
    logger: Logger
    db: Database
    sport: SportClient
    innohassle: InnohassleClient
  }) {
    this.logger = options.logger
    this.db = options.db
    this.sport = options.sport
    this.innohassle = options.innohassle
    this.sportUsersCache = new Map()
  }

  public async upsertUser({
    telegramId,
    ...data
  }: Omit<Partial<User> & Pick<User, 'telegramId' | 'firstName'>, 'createdAt'>): Promise<User> {
    const user = await this.db.user.upsert({
      where: { telegramId },
      create: { telegramId, ...data },
      update: { ...data },
    })
    return User.parse(user)
  }

  public async updateUser({
    telegramId,
    ...patch
  }: Partial<User> & Pick<User, 'telegramId'>): Promise<User> {
    const user = await this.db.user.update({
      where: { telegramId },
      data: patch,
    })
    return User.parse(user)
  }

  public async getStudentBetterThanPercent({
    telegramId,
  }: {
    telegramId: number
  }) {
    return this.requestSport(telegramId, 'getBetterThanPercent')
  }

  public async getTrainingsForUser({
    telegramId,
    from,
    to,
  }: {
    telegramId: number
    from: Date
    to: Date
  }) {
    return this.requestSport(telegramId, 'getTrainings', { from, to })
  }

  public async getTrainingForUser({
    telegramId,
    trainingId,
  }: {
    telegramId: number
    trainingId: number
  }) {
    return this.requestSport(telegramId, 'getTraining', trainingId)
  }

  public checkInUserForTraining({
    telegramId,
    trainingId,
  }: {
    telegramId: number
    trainingId: number
  }) {
    return this.requestSport(telegramId, 'checkInForTraining', trainingId)
  }

  public async cancelCheckInUserForTraining({
    telegramId,
    trainingId,
  }: {
    telegramId: number
    trainingId: number
  }) {
    return this.requestSport(telegramId, 'cancelCheckInForTraining', trainingId)
  }

  public async getSemestersSummary({
    telegramId,
  }: {
    telegramId: number
  }): Promise<SemesterSummary[]> {
    const [semesters, sportHours, allFitnessTests] = await Promise.all([
      this.requestSport(telegramId, 'getAllSemesters'),
      this.requestSport(telegramId, 'getSportHoursInfo'),
      this.requestSport(telegramId, 'getAllFitnessTestResults'),
    ])

    const allSportHours = [
      sportHours.ongoing_semester,
      ...sportHours.last_semesters_hours,
    ]

    return semesters.map(({ id, name }) => {
      const semesterSportHours = allSportHours.find(h => h.id_sem === id)
      const semesterFitnessTest = allFitnessTests.find(t => t.semester === name)

      return {
        title: name,
        hoursTotal: semesterSportHours
          ? (semesterSportHours.hours_not_self + semesterSportHours.hours_self_not_debt)
          : 0,
        fitnessTest: semesterFitnessTest
          ? {
              passed: semesterFitnessTest.grade,
              pointsTotal: semesterFitnessTest.total_score,
            }
          : {
              passed: false,
              pointsTotal: 0,
            },
      }
    })
  }

  public async isUserAuthorized(telegramId: number): Promise<boolean> {
    return !!(await this.getUserSportData(telegramId))
  }

  private async requestSport<M extends keyof SportClient>(
    telegramId: number,
    method: M,
    ...params: Parameters<SportClient[M]>
  ): Promise<Awaited<ReturnType<SportClient[M]>>> {
    return this.requestSportWithRetry(true, telegramId, method, ...params)
  }

  private async requestSportWithRetry<M extends keyof SportClient>(
    retry: boolean,
    telegramId: number,
    method: M,
    ...params: Parameters<SportClient[M]>
  ): Promise<Awaited<ReturnType<SportClient[M]>>> {
    const { id, accessToken } = await this.getUserSportData(telegramId)
    this.sport.setStudentId(id)
    this.sport.setToken(accessToken)
    try {
      return await (this.sport[method] as any).apply(this.sport, params)
    } catch (err) {
      if (
        retry
        && err instanceof AxiosError
        && err.response
        && err.response.status === 401
      ) {
        this.logger.debug({ msg: 'request to sport API returned 401, retrying...' })
        await this.refreshUserSportData(telegramId)
        return this.requestSportWithRetry(false, telegramId, method, ...params)
      }
      throw err
    }
  }

  private async getUserSportData(telegramId: number): Promise<UserSportInfo> {
    const cachedInfo = this.sportUsersCache.get(telegramId)
    if (cachedInfo) {
      return cachedInfo
    }
    return await this.refreshUserSportData(telegramId)
  }

  private async refreshUserSportData(telegramId: number): Promise<UserSportInfo> {
    this.logger.debug({
      msg: 'refreshing sport data for user',
      telegramId: telegramId,
    })

    let accessToken
    try {
      accessToken = await this.innohassle.generateSportTokenForUser({ telegramId })
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response && err.response.status === 404) {
          throw new TelegramNotLinkedToInnohassleAccountError(`User with Telegram ID ${telegramId} has not linked his Telegram account to InNoHassle account.`)
        }
      }
      throw err
    }

    this.sport.setToken(accessToken)
    const sportInfo = await this.sport.getMe()
    const info = {
      ...sportInfo,
      accessToken,
    }
    this.sportUsersCache.set(telegramId, info)
    return info
  }
}

type UserSportInfo = Awaited<ReturnType<SportClient['getMe']>> & {
  accessToken: string
}
