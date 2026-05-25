import {
  DAY_MS,
  MINUTE_MS,
  getPlanningDayBounds,
  getWorkWindowUtc,
  isWithinWorkHours,
  getZonedParts,
} from './timezoneUtils.js'

const SLOT_STEP_MINUTES = 30

/**
 * @typedef {{ startUtc: number, endUtc: number, durationMinutes: number }} OverlapSlot
 */

/**
 * @param {{ timeZone: string }[]} cities
 * @param {number} durationMinutes
 * @param {number} [planningAnchorMs]
 */
export function computeOverlap(cities, durationMinutes, planningAnchorMs = Date.now()) {
  if (cities.length < 2) {
    return {
      planningStartUtc: planningAnchorMs,
      planningEndUtc: planningAnchorMs + DAY_MS,
      slots: /** @type {OverlapSlot[]} */ ([]),
      workWindows: /** @type {Record<string, { workStartUtc: number, workEndUtc: number }>} */ ({}),
    }
  }

  const anchorTz = cities[0].timeZone
  const { startUtc: planningStartUtc, endUtc: planningEndUtc } = getPlanningDayBounds(
    anchorTz,
    new Date(planningAnchorMs),
  )

  /** @type {Record<string, { workStartUtc: number, workEndUtc: number }>} */
  const workWindows = {}
  for (const city of cities) {
    workWindows[city.timeZone] = getWorkWindowUtc(city.timeZone, planningStartUtc)
  }

  /** @type {OverlapSlot[]} */
  const slots = []
  const stepMs = SLOT_STEP_MINUTES * MINUTE_MS

  for (let t = planningStartUtc; t + durationMinutes * MINUTE_MS <= planningEndUtc; t += stepMs) {
    const fitsAll = cities.every((c) => isWithinWorkHours(c.timeZone, t, durationMinutes))
    if (!fitsAll) continue

    const endUtc = t + durationMinutes * MINUTE_MS
    const last = slots[slots.length - 1]
    if (last && last.endUtc === t) {
      last.endUtc = endUtc
    } else {
      slots.push({ startUtc: t, endUtc, durationMinutes })
    }
  }

  return { planningStartUtc, planningEndUtc, slots, workWindows }
}

/**
 * Expand merged slots into discrete start times for clicking.
 * @param {OverlapSlot[]} slots
 * @param {number} durationMinutes
 */
export function expandSlotStarts(slots, durationMinutes) {
  /** @type {number[]} */
  const starts = []
  const stepMs = SLOT_STEP_MINUTES * MINUTE_MS
  const durationMs = durationMinutes * MINUTE_MS

  for (const slot of slots) {
    for (let t = slot.startUtc; t + durationMs <= slot.endUtc; t += stepMs) {
      starts.push(t)
    }
  }
  return starts
}

/**
 * Score slot: lower is better (closer to local noon / core work hours).
 * @param {{ timeZone: string, name: string }[]} cities
 * @param {number} startUtc
 */
export function scoreSlot(startUtc, cities) {
  let total = 0
  for (const city of cities) {
    const { hour, minute } = getZonedParts(city.timeZone, startUtc)
    const fractional = hour + minute / 60
    const distFromNoon = Math.abs(fractional - 12)
    const earlyPenalty = fractional < 9 ? (9 - fractional) * 2 : 0
    const latePenalty = fractional > 16 ? (fractional - 16) * 2 : 0
    total += distFromNoon + earlyPenalty + latePenalty
  }
  return total / cities.length
}

/**
 * @param {{ timeZone: string }[]} cities
 * @param {number[]} slotStarts
 */
export function findBestSlotStart(slotStarts, cities) {
  if (!slotStarts.length) return null
  let best = slotStarts[0]
  let bestScore = scoreSlot(best, cities)
  for (const start of slotStarts) {
    const s = scoreSlot(start, cities)
    if (s < bestScore) {
      bestScore = s
      best = start
    }
  }
  return best
}

/**
 * @param {number} utcMs
 * @param {number} planningStartUtc
 * @param {number} planningEndUtc
 */
export function utcToTimelinePercent(utcMs, planningStartUtc, planningEndUtc) {
  const span = planningEndUtc - planningStartUtc
  if (span <= 0) return 0
  return Math.max(0, Math.min(100, ((utcMs - planningStartUtc) / span) * 100))
}
