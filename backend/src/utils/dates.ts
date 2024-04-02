export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export class Day {
  constructor(public year: number, public month: number, public date: number) {}

  public static fromString(dateStr: string): Day {
    const [year, month, date] = dateStr.split('-').map(Number)
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(date)) {
      throw new TypeError(`Failed to parse date string: "${dateStr}".`)
    }
    return new Day(year, month, date)
  }

  public static fromDate(date: Date, timezone: string = 'UTC'): Day {
    const offset = getTimezoneOffset(timezone)
    const dateTz = new Date(date.getTime() + offset)

    return new Day(
      dateTz.getUTCFullYear(),
      dateTz.getUTCMonth() + 1,
      dateTz.getUTCDate(),
    )
  }

  public toString(): string {
    return `${
      this.year
    }-${
      this.month.toString().padStart(2, '0')
    }-${
      this.date.toString().padStart(2, '0')
    }`
  }

  public asDate(timezone: string = 'UTC'): Date {
    const offset = getTimezoneOffset(timezone)
    return new Date(Date.UTC(this.year, this.month - 1, this.date) + offset)
  }

  public get weekday(): Weekday {
    const date = new Date(this.year, this.month - 1, this.date)
    return date.toLocaleString('en-US', { weekday: 'short' }).toLowerCase() as Weekday
  }

  public boundaries(timezone: string = 'UTC'): [Date, Date] {
    const offset = getTimezoneOffset(timezone)
    const startDateUtc = new Date(Date.UTC(this.year, this.month - 1, this.date))
    const endDateUtc = new Date(Date.UTC(this.year, this.month - 1, this.date + 1))

    return [
      new Date(startDateUtc.getTime() - offset),
      new Date(endDateUtc.getTime() - offset),
    ]
  }

  /**
   * Returns:
   * - 0 if this day is equal to the other day;
   * - -1 if this day is before the other day;
   * -  1 if this day is after the other day.
   */
  public compare(other: Day): number {
    if (this.year !== other.year) {
      return this.year < other.year ? -1 : 1
    }
    if (this.month !== other.month) {
      return this.month < other.month ? -1 : 1
    }
    if (this.date !== other.date) {
      return this.date < other.date ? -1 : 1
    }
    return 0
  }

  public shift(days: number): Day {
    const date = this.asDate()
    date.setDate(date.getDate() + days)
    return Day.fromDate(date)
  }
}

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
 * Returns the time in format 'HH:MM' for the given date and timezone.
 */
export function clockTime(date: Date, timezone?: string): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  })
}

/**
 * Returns an array of days that span from the first Monday on or before `from`
 * to the last Sunday on or after `to`. The array contains `null` for days
 * outside the range `[from, to]`.
 */
export function getSpanningWeeks(from: Day, to: Day): (null | Day)[][] {
  if (from.compare(to) > 0) {
    return []
  }

  let tmp = from
  while (tmp.weekday !== 'mon') {
    tmp = tmp.shift(-1)
  }
  const firstMon = tmp

  tmp = to
  while (tmp.weekday !== 'sun') {
    tmp = tmp.shift(1)
  }
  const lastSun = tmp

  const weeks: (null | Day)[][] = []
  for (let day = firstMon; day.compare(lastSun) <= 0; day = day.shift(1)) {
    if (day.weekday === 'mon') {
      weeks.push([])
    }
    if (day.compare(from) >= 0 && day.compare(to) <= 0) {
      weeks[weeks.length - 1].push(day)
    } else {
      weeks[weeks.length - 1].push(null)
    }
  }

  return weeks
}
