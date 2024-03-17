import { User } from './schemas/user'
import type { Logger } from '~/utils/logging'
import type { Database } from '~/services/database'
import type { SportClient } from '~/services/sport'

export class Domain {
  private logger: Logger
  private db: Database
  private sport: SportClient

  constructor(options: {
    logger: Logger
    db: Database
    sport: SportClient
  }) {
    this.logger = options.logger
    this.db = options.db
    this.sport = options.sport
  }

  public async upsertUser({
    telegramId,
    ...data
  }: Omit<Partial<User> & Pick<User, 'telegramId' | 'firstName' | 'notificationPreferences'>, 'createdAt'>): Promise<User> {
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
  }): Promise<number> {
    const user = await this.db.user.findUnique({
      where: { telegramId },
      select: { sportId: true },
    })

    if (!user) {
      throw new Error(`User with Telegram ID ${telegramId} is not found.`)
    }

    if (!user.sportId) {
      throw new Error(`User with Telegram ID ${telegramId} has no sport ID.`)
    }

    return await this.sport.getBetterThan({ studentId: user.sportId })
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
    const user = await this.db.user.findFirstOrThrow({
      where: {
        telegramId: telegramId,
        sportId: { not: null },
      },
      select: {
        sportId: true,
      },
    })

    return await this.sport.getTrainings({
      studentId: user.sportId!,
      from: from,
      to: to,
    })
  }

  public async getTrainingForUser({
    telegramId,
    trainingId,
  }: {
    telegramId: number
    trainingId: number
  }) {
    const user = await this.db.user.findFirstOrThrow({
      where: {
        telegramId: telegramId,
        sportId: { not: null },
      },
      select: {
        sportId: true,
      },
    })

    return await this.sport.getTraining({
      studentId: user.sportId!,
      trainingId: trainingId,
    })
  }

  public async checkInUserForTraining({
    telegramId,
    trainingId,
  }: {
    telegramId: number
    trainingId: number
  }) {
    const user = await this.db.user.findFirstOrThrow({
      where: {
        telegramId: telegramId,
        sportId: { not: null },
      },
      select: { sportId: true },
    })
    await this.sport.checkInForTraining({
      studentId: user.sportId!,
      trainingId: trainingId,
    })
  }

  public async cancelCheckInUserForTraining({
    telegramId,
    trainingId,
  }: {
    telegramId: number
    trainingId: number
  }) {
    const user = await this.db.user.findFirstOrThrow({
      where: {
        telegramId: telegramId,
        sportId: { not: null },
      },
      select: { sportId: true },
    })
    await this.sport.cancelCheckInForTraining({
      studentId: user.sportId!,
      trainingId: trainingId,
    })
  }
}
