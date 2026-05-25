const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const WORK_START_HOUR = 9
const WORK_END_HOUR = 17

const dateTimeCache = new Map()

/**
 * @param {string} timeZone
 */
function getDateTimeFormatter(timeZone) {
  if (!dateTimeCache.has(timeZone)) {
    dateTimeCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    )
  }
  return dateTimeCache.get(timeZone)
}

/**
 * @param {Intl.DateTimeFormatPart[]} parts
 */
function partsToObject(parts) {
  /** @type {Record<string, string>} */
  const out = {}
  for (const p of parts) {
    if (p.type !== 'literal') out[p.type] = p.value
  }
  return out
}

/**
 * @param {string} timeZone
 * @param {number} utcMs
 */
export function getZonedParts(timeZone, utcMs) {
  const parts = partsToObject(getDateTimeFormatter(timeZone).formatToParts(new Date(utcMs)))
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second ?? 0),
  }
}

/**
 * Resolve UTC timestamp for a local wall-clock time in a given IANA zone.
 * @param {string} timeZone
 * @param {number} year
 * @param {number} month 1-12
 * @param {number} day
 * @param {number} hour
 * @param {number} minute
 */
export function localToUtc(timeZone, year, month, day, hour, minute = 0) {
  let guess = Date.UTC(year, month - 1, day, hour, minute, 0)

  for (let i = 0; i < 6; i += 1) {
    const zoned = getZonedParts(timeZone, guess)
    const targetLocal = Date.UTC(year, month - 1, day, hour, minute, 0)
    const actualLocal = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, 0)
    const diff = targetLocal - actualLocal
    if (diff === 0) return guess
    guess += diff
  }

  return guess
}

/**
 * @param {string} timeZone
 * @param {Date} [anchor]
 */
export function getPlanningDayBounds(timeZone, anchor = new Date()) {
  const parts = getZonedParts(timeZone, anchor.getTime())
  const startUtc = localToUtc(timeZone, parts.year, parts.month, parts.day, 0, 0)
  return { startUtc, endUtc: startUtc + DAY_MS, ymd: parts }
}

/**
 * @param {string} timeZone
 * @param {number} planningStartUtc
 */
export function getWorkWindowUtc(timeZone, planningStartUtc) {
  const parts = getZonedParts(timeZone, planningStartUtc)
  const workStartUtc = localToUtc(timeZone, parts.year, parts.month, parts.day, WORK_START_HOUR, 0)
  const workEndUtc = localToUtc(timeZone, parts.year, parts.month, parts.day, WORK_END_HOUR, 0)
  return { workStartUtc, workEndUtc }
}

/**
 * @param {string} timeZone
 * @param {number} utcMs
 * @param {number} durationMinutes
 */
export function isWithinWorkHours(timeZone, utcMs, durationMinutes = 0) {
  const { hour, minute } = getZonedParts(timeZone, utcMs)
  const startMinutes = hour * 60 + minute
  const endMinutes = startMinutes + durationMinutes
  const workStart = WORK_START_HOUR * 60
  const workEnd = WORK_END_HOUR * 60
  return startMinutes >= workStart && endMinutes <= workEnd
}

/**
 * @param {number} utcMs
 * @param {boolean} use12h
 */
export function formatUtc(utcMs, use12h = true) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: use12h,
    timeZoneName: 'short',
  }).format(new Date(utcMs))
}

/**
 * @param {number} utcMs
 * @param {string} timeZone
 * @param {boolean} use12h
 */
export function formatInZone(utcMs, timeZone, use12h = true) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: use12h,
  }).format(new Date(utcMs))
}

/**
 * @param {number} utcMs
 * @param {string} timeZone
 */
export function formatHourLabel(utcMs, timeZone, use12h) {
  if (use12h) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: true,
    }).format(new Date(utcMs))
  }
  const { hour } = getZonedParts(timeZone, utcMs)
  return `${String(hour).padStart(2, '0')}:00`
}

/**
 * @param {number} utcMs
 * @param {string} timeZone
 */
export function getLocalHourFraction(timeZone, utcMs) {
  const { hour, minute } = getZonedParts(timeZone, utcMs)
  return hour + minute / 60
}

/**
 * Work-hour segments visible within a planning window (handles partial / split days).
 * @param {string} timeZone
 * @param {number} planningStartUtc
 * @param {number} planningEndUtc
 * @returns {{ startUtc: number, endUtc: number }[]}
 */
export function getWorkIntervalsInWindow(timeZone, planningStartUtc, planningEndUtc) {
  const step = 15 * MINUTE_MS
  /** @type {{ startUtc: number, endUtc: number }[]} */
  const intervals = []
  let openStart = null

  for (let t = planningStartUtc; t <= planningEndUtc; t += step) {
    const inWork = isWithinWorkHours(timeZone, t, 0)
    if (inWork && openStart == null) openStart = t
    if (!inWork && openStart != null) {
      intervals.push({ startUtc: openStart, endUtc: t })
      openStart = null
    }
  }

  if (openStart != null) {
    intervals.push({ startUtc: openStart, endUtc: planningEndUtc })
  }

  return intervals
}

export { WORK_START_HOUR, WORK_END_HOUR, MINUTE_MS, HOUR_MS, DAY_MS }
