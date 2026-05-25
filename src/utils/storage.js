export const FORMAT_KEY = 'atlas-scheduler-12h'

/** @returns {boolean} */
export function loadTimeFormatPreference() {
  try {
    return localStorage.getItem(FORMAT_KEY) !== '24'
  } catch {
    return true
  }
}

/** @param {boolean} use12h */
export function saveTimeFormatPreference(use12h) {
  try {
    localStorage.setItem(FORMAT_KEY, use12h ? '12' : '24')
  } catch {
    /* ignore */
  }
}
