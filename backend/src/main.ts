import { loadConfigFromEnv } from './config'
import { createLogger } from './lib/logging'
import { createBot } from './bot'

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
  })

  await bot.start()
}

main()
