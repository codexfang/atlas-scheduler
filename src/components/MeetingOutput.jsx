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
      <div className="min-w-0 max-w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
    <div className="min-w-0 max-w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Meeting details
          </h2>
          <p className="mt-1 text-xs text-slate-500">Aligned across all selected cities</p>
        </div>
        <div className="flex w-full max-w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => copy(plainText, 'plain')}
            className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 sm:w-auto"
          >
            {copied === 'plain' ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            type="button"
            onClick={() => copy(slackText, 'slack')}
            className="w-full min-w-0 rounded-lg border border-indigo-200 bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            {copied === 'slack' ? 'Copied!' : 'Copy as Slack'}
          </button>
          <button
            type="button"
            onClick={() => copy(shareUrl, 'link')}
            className="w-full min-w-0 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:w-auto"
          >
            {copied === 'link' ? 'Link copied!' : 'Copy share link'}
          </button>
        </div>
      </div>

      <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 font-sans text-sm leading-relaxed text-slate-800 sm:p-4">
        {plainText}
      </pre>

      {copied === 'error' && (
        <p className="mt-2 text-sm text-red-600">Clipboard access denied. Copy manually from above.</p>
      )}
    </div>
  )
}
