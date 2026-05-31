import { useState } from 'react'
import { utcToTimelinePercent } from '../utils/overlapEngine.js'
import { formatInZone } from '../utils/timezoneUtils.js'

/**
 * @param {{
 *   slots: { startUtc: number, endUtc: number }[],
 *   slotStarts: number[],
 *   selectedStartUtc: number | null,
 *   durationMinutes: number,
 *   planningStartUtc: number,
 *   planningEndUtc: number,
 *   onSelectSlot: (utc: number) => void,
 *   bestStartUtc?: number | null,
 *   anchorTimezone?: string,
 *   use12h?: boolean,
 * }} props
 */
export default function OverlapHighlighter({
  slots,
  slotStarts,
  selectedStartUtc,
  durationMinutes,
  planningStartUtc,
  planningEndUtc,
  onSelectSlot,
  bestStartUtc = null,
  anchorTimezone = 'UTC',
  use12h = true,
}) {
  const durationMs = durationMinutes * 60 * 1000
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (startUtc, e) => {
    setHoveredSlot(startUtc)
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredSlot(null)
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {slots.map((slot) => (
        <div
          key={`${slot.startUtc}-${slot.endUtc}`}
          className="absolute top-0 bottom-0 bg-emerald-400/20"
          style={{
            left: `${utcToTimelinePercent(slot.startUtc, planningStartUtc, planningEndUtc)}%`,
            width: `${utcToTimelinePercent(slot.endUtc, planningStartUtc, planningEndUtc) - utcToTimelinePercent(slot.startUtc, planningStartUtc, planningEndUtc)}%`,
          }}
        />
      ))}

      <div className="pointer-events-auto absolute inset-0">
        {slotStarts.map((startUtc) => {
          const left = utcToTimelinePercent(startUtc, planningStartUtc, planningEndUtc)
          const width =
            utcToTimelinePercent(startUtc + durationMs, planningStartUtc, planningEndUtc) - left
          const isSelected = selectedStartUtc === startUtc
          const isBest = bestStartUtc === startUtc && !isSelected

          return (
            <button
              key={startUtc}
              type="button"
              onClick={() => onSelectSlot(startUtc)}
              onMouseEnter={(e) => handleMouseEnter(startUtc, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`absolute top-1 bottom-1 rounded-md border transition-all duration-200 ${
                isSelected
                  ? 'z-10 border-indigo-500 bg-indigo-500/35 shadow-md ring-2 ring-indigo-300'
                  : isBest
                    ? 'border-emerald-500/60 bg-emerald-500/25 hover:bg-emerald-500/35'
                    : 'border-emerald-600/30 bg-emerald-500/15 hover:bg-emerald-500/30'
              }`}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%` }}
            />
          )
        })}
      </div>

      {hoveredSlot != null && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
          style={{
            left: mousePos.x + 12,
            top: mousePos.y - 40,
          }}
        >
          <span className="whitespace-nowrap text-sm font-medium text-slate-800">
            {formatInZone(hoveredSlot, anchorTimezone, use12h)}
            {' \u2013 '}
            {formatInZone(hoveredSlot + durationMs, anchorTimezone, use12h)}
          </span>
        </div>
      )}
    </div>
  )
}
