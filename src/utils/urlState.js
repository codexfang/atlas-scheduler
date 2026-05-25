import { getCityByCode } from '../data/cities.js'

const STORAGE_KEY = 'atlas-scheduler-recent'
const MAX_RECENT = 5

/**
 * @param {{ code: string }[]} cities
 * @param {number} duration
 */
export function buildShareUrl(cities, duration) {
  const params = new URLSearchParams()
  if (cities.length) {
    params.set('cities', cities.map((c) => c.code).join(','))
  }
  if (duration === 30 || duration === 60) {
    params.set('duration', String(duration))
  }
  const base = import.meta.env.BASE_URL || '/'
  const path = base.endsWith('/') ? base : `${base}/`
  const qs = params.toString()
  return `${window.location.origin}${path}${qs ? `?${qs}` : ''}`
}

/**
 * @returns {{ cities: import('../data/cities.js').City[], duration: number }}
 */
export function parseUrlState() {
  const params = new URLSearchParams(window.location.search)
  const codes = (params.get('cities') ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

  /** @type {import('../data/cities.js').City[]} */
  const cities = []
  for (const code of codes) {
    const city = getCityByCode(code)
    if (city && !cities.some((c) => c.id === city.id)) {
      cities.push(city)
    }
    if (cities.length >= 5) break
  }

  const durationRaw = Number(params.get('duration'))
  const duration = durationRaw === 30 ? 30 : 60

  return { cities, duration }
}

/**
 * @param {{ code: string }[]} cities
 */
export function syncUrlState(cities, duration) {
  const params = new URLSearchParams()
  if (cities.length) {
    params.set('cities', cities.map((c) => c.code).join(','))
  }
  params.set('duration', String(duration))
  const qs = params.toString()
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`
  window.history.replaceState(null, '', newUrl)
}

/**
 * @param {string[]} cityIds
 */
export function saveRecentSelection(cityIds) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    /** @type {string[][]} */
    const list = raw ? JSON.parse(raw) : []
    const key = cityIds.join('|')
    const filtered = list.filter((entry) => entry.join('|') !== key)
    filtered.unshift(cityIds)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)))
  } catch {
    /* ignore storage errors */
  }
}

/** @returns {string[][]} */
export function loadRecentSelections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
