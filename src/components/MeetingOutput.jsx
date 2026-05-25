import { useState } from 'react'
import { formatInZone, formatUtc } from '../utils/timezoneUtils.js'
import { buildShareUrl } from '../utils/urlState.js'

/**
 * @param {{
 *   cities: import('../data/cities.js').City[],
 *   duration: number,
 *   selectedStartUtc: number | null,
 *   use12h: boolean,
 * }} props
 */
export default function MeetingOutput({ cities, duration, selectedStartUtc, use12h }) {
  const [copied, setCopied] = useState(null)

  if (!selectedStartUtc || cities.length < 2) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Meeting details
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Click an available slot on the timeline to generate meeting text and copy options.
        </p>
      </div>
    )
  }

  const lines = cities.map(
    (c) => `${formatInZone(selectedStartUtc, c.timeZone, use12h)} (${c.name})`,
  )

  const plainText = [
    'Meeting scheduled:',
    ...lines,
    `UTC: ${formatUtc(selectedStartUtc, use12h)}`,
    `Duration: ${duration} minutes`,
  ].join('\n')

  const slackText = [
    '*Meeting scheduled*',
    ...lines.map((l) => `• ${l}`),
    `• *UTC:* ${formatUtc(selectedStartUtc, use12h)}`,
    `• *Duration:* ${duration} min`,
  ].join('\n')

  const copy = async (text, kind) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied('error')
    }
  }

  const shareUrl = buildShareUrl(cities, duration)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Meeting details
          </h2>
          <p className="mt-1 text-xs text-slate-500">Aligned across all selected cities</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copy(plainText, 'plain')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            {copied === 'plain' ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            type="button"
            onClick={() => copy(slackText, 'slack')}
            className="rounded-lg border border-indigo-200 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            {copied === 'slack' ? 'Copied!' : 'Copy as Slack Message'}
          </button>
          <button
            type="button"
            onClick={() => copy(shareUrl, 'link')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {copied === 'link' ? 'Link copied!' : 'Copy share link'}
          </button>
        </div>
      </div>

      <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800">
        {plainText}
      </pre>

      {copied === 'error' && (
        <p className="mt-2 text-sm text-red-600">Clipboard access denied. Copy manually from above.</p>
      )}
    </div>
  )
}
