import { loadConfigFromEnv } from './config'
import { createLogger } from './lib/logging'
import { createBot } from './bot'
import { Domain } from './domain'
import { createDatabase } from './services/database'
import { Sport } from './services/sport'

async function main() {
  const config = loadConfigFromEnv()
  const logger = createLogger(
    config.environment === 'development'
      ? { level: 'debug', pretty: true }
      : { level: 'info', pretty: false },
  )

  const bot = createBot({
    logger: logger.child({ tag: 'bot' }),
    token: config.bot.token,
    domain: new Domain({
      logger: logger.child({ tag: 'domain' }),
      db: await createDatabase({
        logger: logger.child({ tag: 'database' }),
        connectionUrl: config.postgresUrl,
      }),
      sport: new Sport(),
    }),
  })

  await bot.start()
}

main()
