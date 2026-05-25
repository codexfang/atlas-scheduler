import { useCallback, useEffect, useState } from 'react'
import CitySelector from './components/CitySelector.jsx'
import Timeline from './components/Timeline.jsx'
import MeetingOutput from './components/MeetingOutput.jsx'
import { parseUrlState, syncUrlState, saveRecentSelection } from './utils/urlState.js'
import { loadTimeFormatPreference, saveTimeFormatPreference } from './utils/storage.js'

export default function App() {
  const initial = parseUrlState()
  const [cities, setCities] = useState(initial.cities)
  const [duration, setDuration] = useState(initial.duration)
  const [selectedStartUtc, setSelectedStartUtc] = useState(null)
  const [use12h, setUse12h] = useState(loadTimeFormatPreference)
  const [timelineLoading, setTimelineLoading] = useState(false)

  const ready = cities.length >= 2

  useEffect(() => {
    syncUrlState(cities, duration)
    if (cities.length >= 2) {
      saveRecentSelection(cities.map((c) => c.id))
    }
  }, [cities, duration])

  const bumpTimeline = useCallback(() => {
    setSelectedStartUtc(null)
    if (cities.length >= 2) {
      setTimelineLoading(true)
      window.setTimeout(() => setTimelineLoading(false), 280)
    }
  }, [cities.length])

  const handleCitiesChange = useCallback(
    (next) => {
      setCities(next)
      bumpTimeline()
    },
    [bumpTimeline],
  )

  const handleDurationChange = useCallback(
    (d) => {
      setDuration(d)
      bumpTimeline()
    },
    [bumpTimeline],
  )

  const toggleFormat = () => {
    setUse12h((prev) => {
      const next = !prev
      saveTimeFormatPreference(next)
      return next
    })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Atlas Scheduler
            </h1>
            <button
              type="button"
              onClick={toggleFormat}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
              aria-pressed={use12h}
            >
              Time format: {use12h ? '12-hour' : '24-hour'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,340px)_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:self-start">
            <CitySelector
              selected={cities}
              onChange={handleCitiesChange}
              duration={duration}
              onDurationChange={handleDurationChange}
              disabled={false}
            />
          </aside>

          <section
            className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-opacity duration-300 ${
              ready ? 'opacity-100' : 'pointer-events-none opacity-60'
            }`}
            aria-disabled={!ready}
          >
            <Timeline
              cities={cities}
              duration={duration}
              selectedStartUtc={selectedStartUtc}
              onSelectSlot={setSelectedStartUtc}
              use12h={use12h}
              loading={timelineLoading && ready}
            />
          </section>
        </div>

        <div className="mt-8">
          <MeetingOutput
            cities={cities}
            duration={duration}
            selectedStartUtc={selectedStartUtc}
            use12h={use12h}
          />
        </div>
      </main>
    </div>
  )
}
