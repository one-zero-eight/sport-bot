import { PrismaClient } from './generated-prisma-client'
import type { Logger } from '~/utils/logging'

export * from './generated-prisma-client'

export type Database = PrismaClient

export async function createDatabase({
  logger,
  connectionUrl,
}: {
  logger: Logger
  connectionUrl: string
}): Promise<Database> {
  const db = new PrismaClient({
    datasourceUrl: connectionUrl,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  })

  logger.info('connecting to the database', { connectionUrl })
  await db.$connect()
  logger.info('connection established')

  db.$on('query', event => logger.debug({ msg: 'query', event: event }))
  db.$on('info', event => logger.info({ msg: 'info', event: event }))
  db.$on('warn', event => logger.warn({ msg: 'warn', event: event }))
  db.$on('error', event => logger.error({ msg: 'error', event: event }))

  return db
}
