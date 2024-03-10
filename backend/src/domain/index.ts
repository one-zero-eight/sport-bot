import { User } from './schemas/user'
import type { Logger } from '~/lib/logging'
import type { Database } from '~/services/database'
import type { Sport } from '~/services/sport'

export class Domain {
  private logger: Logger
  private db: Database
  private sport: Sport

  constructor(options: {
    logger: Logger
    db: Database
    sport: Sport
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
}
