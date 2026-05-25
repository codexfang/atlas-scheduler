/** @typedef {{ id: string, code: string, name: string, label: string, timeZone: string, region: string }} City */

/** @type {City[]} */
export const CITIES = [
  { id: 'sf', code: 'SF', name: 'San Francisco', label: 'San Francisco, USA', timeZone: 'America/Los_Angeles', region: 'Americas' },
  { id: 'la', code: 'LA', name: 'Los Angeles', label: 'Los Angeles, USA', timeZone: 'America/Los_Angeles', region: 'Americas' },
  { id: 'nyc', code: 'NYC', name: 'New York', label: 'New York, USA', timeZone: 'America/New_York', region: 'Americas' },
  { id: 'chi', code: 'CHI', name: 'Chicago', label: 'Chicago, USA', timeZone: 'America/Chicago', region: 'Americas' },
  { id: 'tor', code: 'TOR', name: 'Toronto', label: 'Toronto, Canada', timeZone: 'America/Toronto', region: 'Americas' },
  { id: 'van', code: 'VAN', name: 'Vancouver', label: 'Vancouver, Canada', timeZone: 'America/Vancouver', region: 'Americas' },
  { id: 'den', code: 'DEN', name: 'Denver', label: 'Denver, USA', timeZone: 'America/Denver', region: 'Americas' },
  { id: 'mex', code: 'MEX', name: 'Mexico City', label: 'Mexico City, Mexico', timeZone: 'America/Mexico_City', region: 'Americas' },
  { id: 'sao', code: 'SAO', name: 'São Paulo', label: 'São Paulo, Brazil', timeZone: 'America/Sao_Paulo', region: 'Americas' },
  { id: 'bog', code: 'BOG', name: 'Bogotá', label: 'Bogotá, Colombia', timeZone: 'America/Bogota', region: 'Americas' },
  { id: 'ldn', code: 'LDN', name: 'London', label: 'London, UK', timeZone: 'Europe/London', region: 'Europe' },
  { id: 'par', code: 'PAR', name: 'Paris', label: 'Paris, France', timeZone: 'Europe/Paris', region: 'Europe' },
  { id: 'ber', code: 'BER', name: 'Berlin', label: 'Berlin, Germany', timeZone: 'Europe/Berlin', region: 'Europe' },
  { id: 'ams', code: 'AMS', name: 'Amsterdam', label: 'Amsterdam, Netherlands', timeZone: 'Europe/Amsterdam', region: 'Europe' },
  { id: 'mad', code: 'MAD', name: 'Madrid', label: 'Madrid, Spain', timeZone: 'Europe/Madrid', region: 'Europe' },
  { id: 'rom', code: 'ROM', name: 'Rome', label: 'Rome, Italy', timeZone: 'Europe/Rome', region: 'Europe' },
  { id: 'zur', code: 'ZUR', name: 'Zurich', label: 'Zurich, Switzerland', timeZone: 'Europe/Zurich', region: 'Europe' },
  { id: 'sto', code: 'STO', name: 'Stockholm', label: 'Stockholm, Sweden', timeZone: 'Europe/Stockholm', region: 'Europe' },
  { id: 'hel', code: 'HEL', name: 'Helsinki', label: 'Helsinki, Finland', timeZone: 'Europe/Helsinki', region: 'Europe' },
  { id: 'war', code: 'WAR', name: 'Warsaw', label: 'Warsaw, Poland', timeZone: 'Europe/Warsaw', region: 'Europe' },
  { id: 'ist', code: 'IST', name: 'Istanbul', label: 'Istanbul, Turkey', timeZone: 'Europe/Istanbul', region: 'Europe' },
  { id: 'dub', code: 'DUB', name: 'Dubai', label: 'Dubai, UAE', timeZone: 'Asia/Dubai', region: 'Middle East' },
  { id: 'tlv', code: 'TLV', name: 'Tel Aviv', label: 'Tel Aviv, Israel', timeZone: 'Asia/Jerusalem', region: 'Middle East' },
  { id: 'mum', code: 'MUM', name: 'Mumbai', label: 'Mumbai, India', timeZone: 'Asia/Kolkata', region: 'Asia' },
  { id: 'del', code: 'DEL', name: 'New Delhi', label: 'New Delhi, India', timeZone: 'Asia/Kolkata', region: 'Asia' },
  { id: 'bkk', code: 'BKK', name: 'Bangkok', label: 'Bangkok, Thailand', timeZone: 'Asia/Bangkok', region: 'Asia' },
  { id: 'sgp', code: 'SGP', name: 'Singapore', label: 'Singapore', timeZone: 'Asia/Singapore', region: 'Asia' },
  { id: 'hkg', code: 'HKG', name: 'Hong Kong', label: 'Hong Kong', timeZone: 'Asia/Hong_Kong', region: 'Asia' },
  { id: 'sha', code: 'SHA', name: 'Shanghai', label: 'Shanghai, China', timeZone: 'Asia/Shanghai', region: 'Asia' },
  { id: 'tyo', code: 'TYO', name: 'Tokyo', label: 'Tokyo, Japan', timeZone: 'Asia/Tokyo', region: 'Asia' },
  { id: 'sel', code: 'SEL', name: 'Seoul', label: 'Seoul, South Korea', timeZone: 'Asia/Seoul', region: 'Asia' },
  { id: 'syd', code: 'SYD', name: 'Sydney', label: 'Sydney, Australia', timeZone: 'Australia/Sydney', region: 'Pacific' },
  { id: 'mel', code: 'MEL', name: 'Melbourne', label: 'Melbourne, Australia', timeZone: 'Australia/Melbourne', region: 'Pacific' },
  { id: 'akl', code: 'AKL', name: 'Auckland', label: 'Auckland, New Zealand', timeZone: 'Pacific/Auckland', region: 'Pacific' },
  { id: 'jhb', code: 'JHB', name: 'Johannesburg', label: 'Johannesburg, South Africa', timeZone: 'Africa/Johannesburg', region: 'Africa' },
  { id: 'cai', code: 'CAI', name: 'Cairo', label: 'Cairo, Egypt', timeZone: 'Africa/Cairo', region: 'Africa' },
  { id: 'lag', code: 'LAG', name: 'Lagos', label: 'Lagos, Nigeria', timeZone: 'Africa/Lagos', region: 'Africa' },
]

const byCode = new Map(CITIES.map((c) => [c.code.toUpperCase(), c]))
const byId = new Map(CITIES.map((c) => [c.id, c]))

/** @param {string} code */
export function getCityByCode(code) {
  return byCode.get(code.toUpperCase()) ?? null
}

/** @param {string} id */
export function getCityById(id) {
  return byId.get(id) ?? null
}

/** @param {string} query */
export function searchCities(query) {
  const q = query.trim().toLowerCase()
  if (!q) return CITIES.slice(0, 12)
  return CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q),
  ).slice(0, 12)
}

/** @type {{ id: string, label: string, cityIds: string[] }[]} */
export const PRESET_GROUPS = [
  {
    id: 'us-eu',
    label: 'US + EU',
    cityIds: ['sf', 'nyc', 'ldn', 'ber'],
  },
  {
    id: 'global',
    label: 'Global Team',
    cityIds: ['sf', 'ldn', 'sgp', 'tyo'],
  },
  {
    id: 'apac',
    label: 'APAC Hub',
    cityIds: ['sgp', 'hkg', 'tyo', 'syd'],
  },
  {
    id: 'americas',
    label: 'Americas',
    cityIds: ['sf', 'nyc', 'chi', 'sao'],
  },
]
