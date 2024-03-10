import { Config, getOptionsFromZodObject } from '~/config'

function main() {
  const options = getOptionsFromZodObject(Config._def)

  const lines: string[] = []
  const usedNames = new Set<string>()

  options.forEach((option, i) => {
    const name = option.envName
    if (usedNames.has(name)) {
      throw new Error(`Duplicate env name: ${name}`)
    }
    usedNames.add(name)

    const descriptionLines = option.description
      ? option.description.split('\n').map(line => `# ${line}`)
      : []

    lines.push(
      ...descriptionLines,
      `${name}=`,
    )

    if (i < options.length - 1) {
      lines.push('')
    }
  })

  // eslint-disable-next-line no-console
  console.log(lines.join('\n'))
}

main()
