import { describe, expect, it } from 'vitest'
import {
  getDateDayInTimezone,
  getDayBoundaries,
  getTimezoneOffset,
} from './dates'

describe('getTimezoneOffset', () => {
  it('returns correct offset for Europe/Moscow', () => {
    expect(getTimezoneOffset('Europe/Moscow')).toBe(10800000)
  })
  it ('returns correct offset for UTC', () => {
    expect(getTimezoneOffset('UTC')).toBe(0)
  })
})

describe('getDateDayInTimezone', () => {
  it('returns correct date for 17/03/2024 in Moscow timezone', () => {
    expect(
      getDateDayInTimezone(new Date('2024-03-17T22:03:00Z'), 'Europe/Moscow'),
    ).toEqual({ year: 2024, month: 3, day: 18 })
  })

  it('returns correct date for 17/03/2024 in UTC timezone', () => {
    expect(
      getDateDayInTimezone(new Date('2024-03-17T22:03:00Z'), 'UTC'),
    ).toEqual({ year: 2024, month: 3, day: 17 })
  })
})

describe('getDayBoundaries', () => {
  it('returns correct boundaries for 17/03/2024 in Moscow timezone', () => {
    expect(
      getDayBoundaries({
        year: 2024,
        month: 3,
        day: 17,
        timezone: 'Europe/Moscow',
      }),
    ).toEqual([
      new Date('2024-03-16T21:00:00Z'),
      new Date('2024-03-17T21:00:00Z'),
    ])
  })

  it('returns correct boundaries for 17/03/2024 in UTC timezone', () => {
    expect(
      getDayBoundaries({
        year: 2024,
        month: 3,
        day: 17,
      }),
    ).toEqual([
      new Date('2024-03-17T00:00:00Z'),
      new Date('2024-03-18T00:00:00Z'),
    ])
  })
})
