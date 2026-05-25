import { useId, useRef, useState } from 'react'
import { PRESET_GROUPS, searchCities, getCityById } from '../data/cities.js'
import { loadRecentSelections } from '../utils/urlState.js'

const MIN_CITIES = 2
const MAX_CITIES = 5

/**
 * @param {{
 *   selected: import('../data/cities.js').City[],
 *   onChange: (cities: import('../data/cities.js').City[]) => void,
 *   duration: number,
 *   onDurationChange: (d: number) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function CitySelector({
  selected,
  onChange,
  duration,
  onDurationChange,
  disabled = false,
}) {
  const listId = useId()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const recents = loadRecentSelections()

  const results = searchCities(query)
  const atMax = selected.length >= MAX_CITIES
  const canAdd = !atMax && !disabled

  const addCity = (city) => {
    if (!canAdd || selected.some((c) => c.id === city.id)) return
    onChange([...selected, city])
    setQuery('')
    setOpen(false)
    setHighlight(0)
    inputRef.current?.focus()
  }

  const removeCity = (id) => {
    onChange(selected.filter((c) => c.id !== id))
  }

  const applyPreset = (preset) => {
    const cities = preset.cityIds
      .map((id) => getCityById(id))
      .filter(Boolean)
      .slice(0, MAX_CITIES)
    onChange(cities)
  }

  const applyRecent = (ids) => {
    const cities = ids.map((id) => getCityById(id)).filter(Boolean).slice(0, MAX_CITIES)
    onChange(cities)
  }

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault()
      addCity(results[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="flex h-full min-w-0 flex-col gap-5 sm:gap-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cities
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Select {MIN_CITIES}–{MAX_CITIES} cities to compare work-hour overlap.
        </p>
      </div>

      <div className="relative">
        <label htmlFor={listId} className="sr-only">
          Search cities
        </label>
        <input
          ref={inputRef}
          id={listId}
          type="text"
          value={query}
          disabled={!canAdd}
          placeholder={atMax ? 'Maximum cities selected' : 'Search city…'}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHighlight(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-listbox`}
        />
        {open && canAdd && results.length > 0 && (
          <ul
            id={`${listId}-listbox`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {results.map((city, i) => (
              <li key={city.id} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  className={`flex w-full flex-col px-4 py-2 text-left text-sm transition hover:bg-indigo-50 ${
                    i === highlight ? 'bg-indigo-50' : ''
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addCity(city)}
                >
                  <span className="font-medium text-slate-900">{city.name}</span>
                  <span className="text-xs text-slate-500">{city.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex min-h-[2.5rem] w-full max-w-full flex-wrap gap-2">
        {selected.length === 0 && (
          <span className="text-sm text-slate-400">No cities selected yet</span>
        )}
        {selected.map((city) => (
          <span
            key={city.id}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 py-1 pl-3 pr-1.5 text-sm font-medium text-indigo-900"
          >
            <span className="truncate">{city.name}</span>
            <button
              type="button"
              aria-label={`Remove ${city.name}`}
              className="rounded-full px-1 text-indigo-600 transition hover:bg-indigo-100 hover:text-indigo-900"
              onClick={() => removeCity(city.id)}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Presets
        </h3>
        <div className="mt-2 flex w-full max-w-full flex-wrap gap-2">
          {PRESET_GROUPS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(preset)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {recents.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recent
          </h3>
          <div className="mt-2 flex flex-col gap-1">
            {recents.map((ids) => {
              const label = ids
                .map((id) => getCityById(id))
                .filter(Boolean)
                .map((c) => c.code)
                .join(' · ')
              return (
                <button
                  key={ids.join('-')}
                  type="button"
                  disabled={disabled}
                  onClick={() => applyRecent(ids)}
                  className="rounded-lg px-2 py-1.5 text-left text-xs text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-slate-100 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Meeting duration
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[30, 60].map((d) => (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onDurationChange(d)}
              className={`min-w-0 rounded-lg border px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
                duration === d
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'
              } disabled:opacity-50`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && selected.length < MIN_CITIES && (
        <p className="text-sm text-amber-700">
          Add at least {MIN_CITIES - selected.length} more{' '}
          {MIN_CITIES - selected.length === 1 ? 'city' : 'cities'} to view overlap.
        </p>
      )}
    </div>
  )
}
