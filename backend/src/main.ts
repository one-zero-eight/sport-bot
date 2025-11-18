import process from 'node:process'
import { program } from 'commander'
import { run } from '@grammyjs/runner'
import type { Config } from './config'
import { loadConfigFromEnv } from './config'
import type { Logger } from './utils/logging'
import { createLogger } from './utils/logging'
import { createBaseBot, createBot } from './bot'
import { Domain } from './domain'
import { createDatabase } from './services/database'
import { SportClient } from './services/sport'
import { InnohassleClient } from './services/innohassle'
import type { Language, Translation } from './translations'
import translations from './translations'
import { DEFAULT_LANGUAGE } from './constants'

async function main() {
  program
    .option('--set-my', 'Call bot\'s `setMy...` methods before starting the bot.', false)
    .option('--set-my-only', 'Only call bot\'s `setMy...` methods without starting the bot.', false)

  program.parse()

  const options = program.opts()
  const config = loadConfigFromEnv()
  const logger = createLogger(
    config.environment === 'development'
      ? { level: 'debug', pretty: true }
      : { level: 'info', pretty: false },
  )

  if (options.setMyOnly) {
    await setMy(config, logger)
    return
  }

  if (options.setMy) {
    try {
      await setMy(config, logger)
    } catch (err) {
      console.warn('Error calling \'setMy...\' methods:', err)
    }
  }

  await runBot(config, logger)
}

async function setMy(config: Config, logger: Logger) {
  const bot = createBaseBot({ token: config.bot.token, config: config })

  for (const [language, translation] of (Object.entries(translations) as [Language, Translation][])) {
    const commands = Object
      .entries(translation['Bot.Commands'])
      .map(([command, description]) => ({ command, description }))
    const intro = translation['Bot.Intro']
    const bio = translation['Bot.Bio']

    const languageLogLabel = language === DEFAULT_LANGUAGE
      ? `default=${language}`
      : language
    const languageCode = language === DEFAULT_LANGUAGE
      ? language
      : undefined // Need to not specify the language code for the default language.

    logger.info(`setMyCommands(${languageLogLabel})...`)
    await bot.api.setMyCommands(commands, {
      scope: { type: 'all_private_chats' },
      language_code: languageCode,
    })

    logger.info(`setMyDescription(${languageLogLabel})...`)
    await bot.api.setMyDescription(intro, { language_code: languageCode })

    logger.info(`setMyShortDescription(${languageLogLabel})...`)
    await bot.api.setMyShortDescription(bio, { language_code: languageCode })
  }
}

async function runBot(config: Config, logger: Logger) {
  const db = await createDatabase({
    logger: logger.child({ tag: 'database' }),
    connectionUrl: config.postgresUrl,
  })

  const bot = createBot({
    logger: logger.child({ tag: 'bot' }),
    token: config.bot.token,
    config: config,
    domain: new Domain({
      logger: logger.child({ tag: 'domain' }),
      db: db,
      sport: new SportClient({
        logger: logger.child({ tag: 'sport' }),
        baseUrl: config.sport.apiBaseUrl,
      }),
      innohassle: new InnohassleClient({
        logger: logger.child({ tag: 'innohassle' }),
        baseUrl: config.innohassle.apiBaseUrl,
        token: config.innohassle.token,
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
