import { utcToTimelinePercent } from '../utils/overlapEngine.js'

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
}) {
  const durationMs = durationMinutes * 60 * 1000

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
              title="Select meeting time"
              onClick={() => onSelectSlot(startUtc)}
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
    </div>
  )
}
