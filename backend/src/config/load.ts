import process from 'node:process'
import dotenv from 'dotenv'
import { createOptionsObject, getOptionsFromZodObject } from './parse'
import { Config } from './schema'

export function loadConfigFromEnv(path?: string): Config {
  dotenv.config({ path })

  const options = createOptionsObject(
    getOptionsFromZodObject(Config._def),
    process.env,
  )

  const parseResult = Config.safeParse(options)
  if (parseResult.success) {
    return parseResult.data
  }

  throw new Error(`Configuration loading failed: ${parseResult.error.message}`)
}
