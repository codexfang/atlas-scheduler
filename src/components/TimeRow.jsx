import { formatHourLabel } from '../utils/timezoneUtils.js'
import { utcToTimelinePercent } from '../utils/overlapEngine.js'

/**
 * @param {{
 *   city: { name: string, timeZone: string, code: string },
 *   planningStartUtc: number,
 *   planningEndUtc: number,
 *   workIntervals: { startUtc: number, endUtc: number }[],
 *   selectedStartUtc: number | null,
 *   durationMinutes: number,
 *   use12h: boolean,
 * }} props
 */
export default function TimeRow({
  city,
  planningStartUtc,
  planningEndUtc,
  workIntervals,
  selectedStartUtc,
  durationMinutes,
  use12h,
}) {
  const hourMarkers = Array.from({ length: 25 }, (_, i) => {
    const utc = planningStartUtc + (i / 24) * (planningEndUtc - planningStartUtc)
    return { utc, label: i % 4 === 0 ? formatHourLabel(utc, city.timeZone, use12h) : '' }
  })

  let selectionStyle = null
  if (selectedStartUtc != null) {
    const endUtc = selectedStartUtc + durationMinutes * 60 * 1000
    const left = utcToTimelinePercent(selectedStartUtc, planningStartUtc, planningEndUtc)
    const width =
      utcToTimelinePercent(endUtc, planningStartUtc, planningEndUtc) - left
    selectionStyle = { left: `${left}%`, width: `${width}%` }
  }

  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0 sm:grid sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-stretch sm:gap-3">
      <div className="mb-2 flex items-baseline justify-between gap-2 sm:mb-0 sm:flex-col sm:justify-center sm:pr-1">
        <span className="truncate text-sm font-semibold text-slate-800">{city.name}</span>
        <span className="shrink-0 text-xs text-slate-500 sm:mt-0.5">{city.code}</span>
      </div>

      <div className="relative w-full min-w-0">
        <div className="relative h-12 overflow-hidden rounded-lg bg-slate-100/80">
          {workIntervals.map((interval) => {
            const left = utcToTimelinePercent(interval.startUtc, planningStartUtc, planningEndUtc)
            const width =
              utcToTimelinePercent(interval.endUtc, planningStartUtc, planningEndUtc) - left
            return (
              <div
                key={`${interval.startUtc}-${interval.endUtc}`}
                className="absolute top-0 bottom-0 rounded-md bg-slate-200/90"
                style={{ left: `${left}%`, width: `${width}%` }}
                aria-hidden
              />
            )
          })}
          {selectionStyle && (
            <div
              className="absolute top-0 bottom-0 rounded-md bg-indigo-500/30 ring-1 ring-indigo-400/50 transition-all duration-200"
              style={selectionStyle}
            />
          )}
        </div>

        <div className="relative mt-1 flex h-4 justify-between text-[10px] text-slate-400">
          {hourMarkers.map((m, i) => (
            <span
              key={i}
              className="w-0 shrink-0 translate-x-[-50%] text-center"
              style={{ flex: i === 24 ? '0' : '1' }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
