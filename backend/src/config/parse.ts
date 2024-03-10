import type { ZodEnumDef, ZodNumberDef, ZodObjectDef, ZodStringDef } from 'zod'
import { z } from 'zod'
import snakeCase from 'lodash/snakeCase'

export type Option = {
  description?: string
  envName: string
  configPath: string[]
}

export function getOptionsFromZodObject(
  def: ZodObjectDef | ZodStringDef | ZodNumberDef | ZodEnumDef,
): Option[] {
  const envs = getEnvsFromZodObject(def, [])
  return envs.map(({ description, nameParts }) => ({
    description: description,
    envName: snakeCase(nameParts.join('_')).toUpperCase(),
    configPath: nameParts,
  }))
}

type Env = {
  description?: string
  nameParts: string[]
}

function getEnvsFromZodObject(
  def: ZodObjectDef | ZodStringDef | ZodNumberDef | ZodEnumDef,
  namePrefixParts: string[],
): Env[] {
  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodString:
    case z.ZodFirstPartyTypeKind.ZodNumber:
    case z.ZodFirstPartyTypeKind.ZodEnum: {
      return [{
        nameParts: namePrefixParts,
        description: def.description,
      }]
    }
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const envs: Env[] = []
      const shape = def.shape()
      for (const key in shape) {
        const subDef = shape[key]
        const subNameParts = [...namePrefixParts, key]
        envs.push(...getEnvsFromZodObject(subDef._def, subNameParts))
      }
      return envs
    }
    default:
      throw new Error(`Unsupported zod definition type: ${(def as any).typeName}.`)
  }
}

export function createOptionsObject<T extends object>(
  options: Option[],
  env: Record<string, string | undefined>,
): T {
  const loadedOptions = {} as T
  for (const option of options) {
    const value = env[option.envName]

    // Get or create corresponding object
    const parts = option.configPath
    let current = loadedOptions
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      current = (current as any)[part] ??= {}
    }

    // Assign value
    const lastPart = parts[parts.length - 1];
    (current as any)[lastPart] = value
  }
  return loadedOptions
}
