import { User } from './schemas/user'
import type { SemesterSummary } from './types'
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

  public async getSemestersSummary({
    telegramId,
  }: {
    telegramId: number
  }): Promise<SemesterSummary[]> {
    const user = await this.db.user.findFirstOrThrow({
      where: {
        telegramId: telegramId,
        sportId: { not: null },
      },
      select: { sportId: true },
    })

    const [semesters, sportHours, allFitnessTests] = await Promise.all([
      this.sport.getAllSemesters(),
      this.sport.getSportHoursInfo({ studentId: user.sportId! }),
      this.sport.getAllFitnessTestResults({ studentId: user.sportId! }),
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
}
