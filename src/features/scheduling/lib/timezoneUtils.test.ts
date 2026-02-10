import {
  getLocalTimezone,
  getTimezoneOffset,
  getTimezoneLabel,
  COMMON_TIMEZONES,
  convertTime,
} from './timezoneUtils'

describe('getLocalTimezone', () => {
  it('returns a non-empty string', () => {
    const tz = getLocalTimezone()
    expect(typeof tz).toBe('string')
    expect(tz.length).toBeGreaterThan(0)
  })

  it('returns a valid IANA timezone', () => {
    const tz = getLocalTimezone()
    // Should contain a slash (e.g. "America/New_York") or be "UTC"
    expect(tz === 'UTC' || tz.includes('/')).toBe(true)
  })
})

describe('getTimezoneOffset', () => {
  it('returns an offset string in +/-HH:MM format', () => {
    const offset = getTimezoneOffset('America/New_York')
    expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/)
  })

  it('returns +00:00 for UTC', () => {
    const offset = getTimezoneOffset('UTC')
    expect(offset).toBe('+00:00')
  })

  it('returns a negative offset for US timezones', () => {
    const offset = getTimezoneOffset('America/Los_Angeles')
    expect(offset.startsWith('-')).toBe(true)
  })

  it('returns a positive offset for Asian timezones', () => {
    const offset = getTimezoneOffset('Asia/Tokyo')
    expect(offset.startsWith('+')).toBe(true)
  })
})

describe('getTimezoneLabel', () => {
  it('returns a label with timezone name and offset', () => {
    const label = getTimezoneLabel('America/New_York')
    expect(label).toContain('America/New_York')
    expect(label).toContain('UTC')
  })

  it('formats as "Timezone (UTC+/-HH:MM)"', () => {
    const label = getTimezoneLabel('UTC')
    expect(label).toBe('UTC (UTC+00:00)')
  })
})

describe('COMMON_TIMEZONES', () => {
  it('contains 20 timezones', () => {
    expect(COMMON_TIMEZONES.length).toBe(20)
  })

  it('contains valid IANA timezone strings', () => {
    for (const tz of COMMON_TIMEZONES) {
      expect(typeof tz).toBe('string')
      expect(tz.includes('/')).toBe(true)
    }
  })

  it('includes major US timezones', () => {
    expect(COMMON_TIMEZONES).toContain('America/New_York')
    expect(COMMON_TIMEZONES).toContain('America/Los_Angeles')
    expect(COMMON_TIMEZONES).toContain('America/Chicago')
  })
})

describe('convertTime', () => {
  it('returns the same time when converting between the same timezone', () => {
    const result = convertTime('09:00', 'America/New_York', 'America/New_York', '2026-02-10')
    expect(result).toBe('09:00')
  })

  it('converts from UTC to a positive-offset timezone', () => {
    // UTC 09:00 -> Asia/Tokyo (+09:00) should be 18:00
    const result = convertTime('09:00', 'UTC', 'Asia/Tokyo', '2026-02-10')
    expect(result).toBe('18:00')
  })

  it('converts from UTC to a negative-offset timezone', () => {
    // UTC 12:00 -> America/New_York (EST, -05:00) should be 07:00
    const result = convertTime('12:00', 'UTC', 'America/New_York', '2026-02-10')
    expect(result).toBe('07:00')
  })

  it('converts between two non-UTC timezones', () => {
    // New York (EST, -5) 12:00 -> Los Angeles (PST, -8) should be 09:00
    const result = convertTime('12:00', 'America/New_York', 'America/Los_Angeles', '2026-02-10')
    expect(result).toBe('09:00')
  })

  it('handles timezone conversion resulting in next day', () => {
    // UTC 23:00 -> Asia/Tokyo (+9) should be 08:00 next day
    const result = convertTime('23:00', 'UTC', 'Asia/Tokyo', '2026-02-10')
    expect(result).toBe('08:00')
  })
})
