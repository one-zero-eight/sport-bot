/**
 * Returns the UTC offset for the given timezone in milliseconds.
 *
 * Example:
 * ```
 * > getTimezoneOffset('Europe/Moscow')
 * 10800000
 * ```
 */
export function getTimezoneOffset(tz: string): number {
  const pivotDateUtc = new Date(Date.UTC(2020, 0, 1, 0, 0, 0, 0))
  const tzDateString = pivotDateUtc.toLocaleString('ru-RU', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
  const match = tzDateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,4}), (\d{1,2}):(\d{1,2}):(\d{1,2})$/)
  if (!match) {
    throw new Error(`Failed to parse date string for timezone ${tz}`)
  }
  const [day, month, year, hours, minutes, seconds] = match.slice(1).map(Number)
  const pivotDateTz = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, 0))
  return pivotDateTz.getTime() - pivotDateUtc.getTime()
}

/**
 * Returns the year, month and day for the given date in the given timezone.
 *
 * Example:
 * ```
 * > getDateDayInTimezone(new Date('2024-03-17T22:03:00Z'), 'Europe/Moscow')
 * { year: 2024, month: 3, day: 18 }
 * ```
 */
export function getDateDayInTimezone(date: Date, tz: string): {
  year: number
  month: number
  day: number
} {
  const offset = getTimezoneOffset(tz)
  const dateTz = new Date(date.getTime() + offset)
  return {
    year: dateTz.getUTCFullYear(),
    month: dateTz.getUTCMonth() + 1,
    day: dateTz.getUTCDate(),
  }
}

/**
 * Returns boundaries for the day in the given timezone.
 *
 * Example:
 * ```
 * > getDayBoundaries({ year: 2024, month: 3, day: 17, timezone: 'Europe/Moscow' })
 * ['2024-03-16T21:00:00Z', '2024-03-17T21:00:00Z']
 * ```
 */
export function getDayBoundaries({
  year,
  month,
  day,
  timezone = 'UTC',
}: {
  year: number
  month: number
  day: number
  timezone?: string
}): [Date, Date] {
  const startDateUtc = new Date(Date.UTC(year, month - 1, day))
  const endDateUtc = new Date(Date.UTC(year, month - 1, day + 1))

  const offset = getTimezoneOffset(timezone)

  const boundaryStart = new Date(startDateUtc.getTime() - offset)
  const boundaryEnd = new Date(endDateUtc.getTime() - offset)

  return [boundaryStart, boundaryEnd]
}

export function clockTime(date: Date, timezone?: string): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  })
}
