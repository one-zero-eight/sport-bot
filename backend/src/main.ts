import process from 'node:process'
import { run } from '@grammyjs/runner'
import { loadConfigFromEnv } from './config'
import { createLogger } from './utils/logging'
import { createBot } from './bot'
import { Domain } from './domain'
import { createDatabase } from './services/database'
import { SportClient } from './services/sport'

async function main() {
  const config = loadConfigFromEnv()
  const logger = createLogger(
    config.environment === 'development'
      ? { level: 'debug', pretty: true }
      : { level: 'info', pretty: false },
  )

  const db = await createDatabase({
    logger: logger.child({ tag: 'database' }),
    connectionUrl: config.postgresUrl,
  })

  const bot = createBot({
    logger: logger.child({ tag: 'bot' }),
    token: config.bot.token,
    domain: new Domain({
      logger: logger.child({ tag: 'domain' }),
      db: db,
      sport: new SportClient({
        logger: logger.child({ tag: 'sport' }),
        baseUrl: config.sport.apiBaseUrl,
        token: config.sport.token,
      }),
    }),
  })

  await bot.init()
  logger.info({ msg: `Starting bot https://t.me/${bot.botInfo.username}` })

  const runner = run(bot)

  const stop = () => {
    runner.stop()
    db.$disconnect()
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)

  await runner.task()
}

main()
