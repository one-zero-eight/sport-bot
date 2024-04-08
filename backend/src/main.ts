import process from 'node:process'
import { program } from 'commander'
import { run } from '@grammyjs/runner'
import { Bot } from 'grammy'
import { loadConfigFromEnv } from './config'
import { createLogger } from './utils/logging'
import { createBot } from './bot'
import { Domain } from './domain'
import { createDatabase } from './services/database'
import { SportClient } from './services/sport'
import { InnohassleClient } from './services/innohassle'
import translations from './translations'

async function main() {
  program
    .option('--set-my', 'Only call bot\'s `setMy...` methods.', false)

  program.parse()

  const options = program.opts()

  if (options.setMy) {
    await setMy()
  } else {
    await runBot()
  }
}

async function setMy() {
  const config = loadConfigFromEnv()
  const logger = createLogger(
    config.environment === 'development'
      ? { level: 'debug', pretty: true }
      : { level: 'info', pretty: false },
  )
  const bot = new Bot(config.bot.token)

  logger.info('setMyCommands(default)...')
  await bot.api.setMyCommands(
    Object.entries(translations.en['Bot.Commands']).map(([command, description]) => ({ command, description })),
    { scope: { type: 'all_private_chats' } },
  )
  logger.info('setMyDescription(default)...')
  await bot.api.setMyDescription(translations.en['Bot.About'])
  logger.info('setMyShortDescription(default)...')
  await bot.api.setMyShortDescription(translations.en['Bot.Bio'])

  for (const [language, translation] of Object.entries(translations).filter(([lang]) => lang !== 'en')) {
    logger.info(`setMyCommands(${language})...`)
    await bot.api.setMyCommands(
      Object.entries(translation['Bot.Commands']).map(([command, description]) => ({ command, description })),
      { scope: { type: 'all_private_chats' }, language_code: language },
    )
    logger.info(`setMyDescription(${language})...`)
    await bot.api.setMyDescription(translation['Bot.About'], { language_code: language })
    logger.info(`setMyShortDescription(${language})...`)
    await bot.api.setMyShortDescription(translation['Bot.Bio'], { language_code: language })
  }
}

async function runBot() {
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
