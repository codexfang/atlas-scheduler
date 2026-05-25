import { useMemo } from 'react'
import TimeRow from './TimeRow.jsx'
import OverlapHighlighter from './OverlapHighlighter.jsx'
import { computeOverlap, expandSlotStarts, findBestSlotStart } from '../utils/overlapEngine.js'
import { getWorkIntervalsInWindow } from '../utils/timezoneUtils.js'

/**
 * @param {{
 *   cities: import('../data/cities.js').City[],
 *   duration: number,
 *   selectedStartUtc: number | null,
 *   onSelectSlot: (utc: number) => void,
 *   use12h: boolean,
 *   loading?: boolean,
 * }} props
 */
export default function Timeline({
  cities,
  duration,
  selectedStartUtc,
  onSelectSlot,
  use12h,
  loading = false,
}) {
  const overlap = useMemo(() => {
    if (cities.length < 2) return null
    return computeOverlap(cities, duration)
  }, [cities, duration])

  const slotStarts = useMemo(() => {
    if (!overlap) return []
    return expandSlotStarts(overlap.slots, duration)
  }, [overlap, duration])

  const bestStartUtc = useMemo(() => {
    if (!overlap || !slotStarts.length) return null
    return findBestSlotStart(slotStarts, cities)
  }, [overlap, slotStarts, cities])

  if (cities.length < 2) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <p className="text-sm font-medium text-slate-600">Timeline unavailable</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Select at least two cities to visualize work hours and overlapping meeting windows.
        </p>
      </div>
    )
  }

  if (loading || !overlap) {
    return (
      <div className="flex h-full min-h-[320px] flex-col gap-4 p-4">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-12 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }

  const { planningStartUtc, planningEndUtc, slots } = overlap

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Work hours overlap
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Default 9:00–17:00 local · {duration}-minute slots · green = available
          </p>
        </div>
        {bestStartUtc != null && (
          <button
            type="button"
            onClick={() => onSelectSlot(bestStartUtc)}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
          >
            Use recommended slot
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[7.5rem_1fr] gap-3 pb-2">
            <div />
            <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <span>Planning day (anchor: {cities[0].name})</span>
              <span>24h local axis per row</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              {cities.map((city) => (
                <TimeRow
                  key={city.id}
                  city={city}
                  planningStartUtc={planningStartUtc}
                  planningEndUtc={planningEndUtc}
                  workIntervals={getWorkIntervalsInWindow(
                    city.timeZone,
                    planningStartUtc,
                    planningEndUtc,
                  )}
                  selectedStartUtc={selectedStartUtc}
                  durationMinutes={duration}
                  use12h={use12h}
                />
              ))}

              <div className="pointer-events-none absolute inset-0 grid grid-cols-[7.5rem_1fr] gap-3">
                <div />
                <div className="relative">
                  <OverlapHighlighter
                    slots={slots}
                    slotStarts={slotStarts}
                    selectedStartUtc={selectedStartUtc}
                    durationMinutes={duration}
                    planningStartUtc={planningStartUtc}
                    planningEndUtc={planningEndUtc}
                    onSelectSlot={onSelectSlot}
                    bestStartUtc={bestStartUtc}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {slotStarts.length === 0 && (
        <p className="mt-4 text-sm text-amber-700">
          No overlapping {duration}-minute windows within standard work hours for this day.
          Try fewer time zones or a shorter duration.
        </p>
      )}
    </div>
  )
}
