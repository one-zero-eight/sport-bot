import { describe, expect, it } from 'vitest'
import type { Weekday } from './dates'
import { Day, getTimezoneOffset } from './dates'

describe('getTimezoneOffset', () => {
  it('returns correct offset for Europe/Moscow', () => {
    expect(getTimezoneOffset('Europe/Moscow')).toBe(10800000)
  })
  it ('returns correct offset for UTC', () => {
    expect(getTimezoneOffset('UTC')).toBe(0)
  })
})

describe('day', () => {
  it('creates correct day from string', () => {
    let day = Day.fromString('2024-03-17')
    expect(day.year).toBe(2024)
    expect(day.month).toBe(3)
    expect(day.date).toBe(17)

    day = Day.fromString('2024-02-29')
    expect(day.year).toBe(2024)
    expect(day.month).toBe(2)
    expect(day.date).toBe(29)
  })

  it('converts to string correctly', () => {
    expect(Day.fromString('2024-03-17').toString()).toBe('2024-03-17')
    expect(Day.fromString('2024-02-29').toString()).toBe('2024-02-29')
  })

  it('creates correct day from date and timezone', () => {
    const date = new Date('2024-03-17T22:03:00Z')
    let day = Day.fromDate(date, 'UTC')
    expect(day.year).toBe(2024)
    expect(day.month).toBe(3)
    expect(day.date).toBe(17)

    day = Day.fromDate(date, 'Europe/Moscow')
    expect(day.year).toBe(2024)
    expect(day.month).toBe(3)
    expect(day.date).toBe(18)
  })

  it('converts to date with timezone correctly', () => {
    let date = Day.fromString('2024-03-17').asDate('UTC')
    expect(date.toISOString()).toBe('2024-03-17T00:00:00.000Z')

    date = Day.fromString('2024-03-17').asDate('Europe/Moscow')
    expect(date.toISOString()).toBe('2024-03-17T03:00:00.000Z')
  })

  it('returns correct weekday', () => {
    const testcases: [string, Weekday][] = [
      ['2024-01-01', 'mon'],
      ['2024-01-02', 'tue'],
      ['2024-01-03', 'wed'],
      ['2024-01-04', 'thu'],
      ['2024-01-05', 'fri'],
      ['2024-01-06', 'sat'],
      ['2024-01-07', 'sun'],

      ['2024-04-01', 'mon'],
      ['2024-04-02', 'tue'],
      ['2024-04-03', 'wed'],
      ['2024-04-04', 'thu'],
      ['2024-04-05', 'fri'],
      ['2024-04-06', 'sat'],
      ['2024-04-07', 'sun'],

      ['2024-12-30', 'mon'],
      ['2024-12-31', 'tue'],
      ['2025-01-01', 'wed'],
      ['2025-01-02', 'thu'],
      ['2025-01-03', 'fri'],
      ['2025-01-04', 'sat'],
      ['2025-01-05', 'sun'],
    ]
    for (const [dateStr, weekday] of testcases) {
      expect(Day.fromString(dateStr).weekday).toBe(weekday)
    }
  })

  it('shifts correctly', () => {
    const testcases: [string, number, string][] = [
      ['2024-01-01', -3, '2023-12-29'],
      ['2024-01-01', -2, '2023-12-30'],
      ['2024-01-01', -1, '2023-12-31'],
      ['2024-01-01', 0, '2024-01-01'],
      ['2024-01-01', 1, '2024-01-02'],
      ['2024-01-01', 2, '2024-01-03'],
      ['2024-01-01', 3, '2024-01-04'],
    ]
    for (const [dateStr, shift, expectedStr] of testcases) {
      expect(Day.fromString(dateStr).shift(shift).toString()).toBe(expectedStr)
    }
  })

  it('returns correct boundaries', () => {
    const testcases: [string, string, [string, string]][] = [
      ['2024-03-17', 'UTC', ['2024-03-17T00:00:00.000Z', '2024-03-18T00:00:00.000Z']],
      ['2024-02-29', 'UTC', ['2024-02-29T00:00:00.000Z', '2024-03-01T00:00:00.000Z']],
      ['2024-03-17', 'Europe/Moscow', ['2024-03-16T21:00:00.000Z', '2024-03-17T21:00:00.000Z']],
      ['2024-02-29', 'Europe/Moscow', ['2024-02-28T21:00:00.000Z', '2024-02-29T21:00:00.000Z']],
    ]
    for (const [dateStr, timezone, [startStr, endStr]] of testcases) {
      const [start, end] = Day.fromString(dateStr).boundaries(timezone)
      expect(start.toISOString()).toBe(startStr)
      expect(end.toISOString()).toBe(endStr)
    }
  })
})
