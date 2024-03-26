import type { TgxElement } from '@telegum/tgx'

export type TableProps = {
  rows: string[][]
  headingRow?: boolean
}

export function Table({
  rows,
  headingRow = false,
}: TableProps): TgxElement {
  if (rows.length === 0) {
    return <></>
  }

  const colCount = rows[0].length
  const colLengths = Array.from({ length: colCount }, () => 0)

  for (const row of rows) {
    for (let i = 0; i < colCount; i++) {
      colLengths[i] = Math.max(colLengths[i], row[i].length)
    }
  }

  const table = []

  for (const row of rows) {
    const cells = row.map((cell, i) => {
      const padding = ' '.repeat(colLengths[i] - cell.length)
      return `${cell}${padding}`
    })
    table.push(cells.join(' | '))
  }

  if (headingRow) {
    const divider = colLengths.map(len => '-'.repeat(len)).join('-+-')
    table.splice(1, 0, divider)
  }

  return (
    <>
      {table.map(row => (
        <code>
          {row}
          <br />
        </code>
      ))}
    </>
  )
}
