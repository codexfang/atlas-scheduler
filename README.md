# Atlas Scheduler

**Atlas Scheduler** helps remote teams find overlapping work hours across multiple global cities and schedule meetings efficiently.

## Project Overview

Distributed teams struggle to align meeting times across time zones. Atlas Scheduler visualizes each city's standard work day (9:00–17:00 local), highlights overlapping windows for 30- or 60-minute meetings, and generates copy-ready meeting text for email or Slack.

## Features

- **City selection** — Autocomplete search with 2–5 cities as removable chips
- **Work hours timeline** — 24-hour horizontal rows per city with local time labels
- **Overlap engine** — DST-aware overlap detection via the Intl API
- **Interactive slots** — Click available windows; selection syncs across all rows
- **Meeting output** — Plain text and Slack-formatted copy, plus shareable URLs
- **Shareable state** — `?cities=SF,LDN,TYO&duration=60` restores selections on load
- **Presets & recents** — Quick-load city groups and recent selections (localStorage)
- **Recommended slot** — Highlights the least awkward time across zones
- **12h / 24h toggle** — User preference persisted in the browser

## Tech Stack

- [React](https://react.dev/) 19 + [Vite](https://vitejs.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) & IANA time zones (no date libraries)

## License

MIT
