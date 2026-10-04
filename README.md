# Daymark

Daymark is a private, single-user productivity and habit tracker built as a static web app. It runs on GitHub Pages without a server, build step, third-party runtime dependencies, or network services.

## Features

- Daily and weekday habits, completion history, streaks, and a seven-day consistency score.
- A five-minute focus timer with a task and two or three small action steps.
- Energy and mood check-ins for morning, afternoon, and evening, with recent and time-of-day averages.
- A technology learning log with topic, duration, date, and plain-text or Markdown notes.
- Daily quests, lifetime momentum points, levels, and milestones earned from completed habits, focus sprints, and learning sessions.
- A daily habit reward plan showing points earned, progress, and a one-tap prompt for the next unfinished habit.
- JSON backup export and validated import.
- Responsive phone, tablet, and desktop layouts; one inherited system font family across the UI; and a service-worker-cached app shell for offline use.

Progress rewards reflect completed actions only; check-ins are never scored, points do not expire, and there are no missed-day penalties or locked features.
Each scheduled habit completion earns +10 Momentum points per day. The daily reward panel resets its day-specific count on the next date while lifetime points remain; after the scheduled routine is complete, the optional next step is a five-minute focus sprint.

## Run locally

Open `index.html` in a browser for a quick preview. For service-worker and installability checks, serve the folder over `http://localhost` or HTTPS; browsers do not enable service workers from `file://` URLs.

## Deploy to GitHub Pages

1. Push the project files to the repository's root branch.
2. In the repository's **Settings → Pages**, choose **Deploy from a branch** and select the root folder.
3. Enable **Enforce HTTPS** after the site is published.

The app uses relative asset paths and does not require a build pipeline.

## Quality gate

Use Node.js 20 or newer. Before committing code changes, update [QUALITY_LOG.md](./QUALITY_LOG.md) with the change summary and checks to be run, then run:

```sh
npm run gate
```

The gate checks app-shell paths, manifest configuration, and JavaScript syntax, then runs the dependency-free Node test suite. A local pre-commit hook runs the same gate automatically. Enable it once per clone:

```sh
git config core.hooksPath .githooks
```

The GitHub Actions workflow runs `npm run gate` for pushes and pull requests. Record exact commands and their results in `QUALITY_LOG.md` before committing. A failed check must be documented, fixed, and rerun; do not commit until all required checks pass.

## Data and schema

The browser stores one JSON document in `localStorage` under `daymark.data`. Its `schemaVersion` is `1.0.0`; separate collections hold habits, habit entries, focus sessions, energy check-ins, and learning logs. UI code works with this document through a small load/save boundary, so persistence can later be moved behind an API without changing the page structure.

Data stays in the current browser profile and is not synchronized or encrypted. Clearing browser storage removes it. Use **Data settings → Export JSON backup** regularly; exported files contain your notes in plain text. Import validates the schema and replaces the current local data.

## Project files

- `index.html` — application markup, styles, and client-side behavior.
- `manifest.json` and `icon.svg` — installable app metadata and icon.
- `sw.js` — versioned, same-origin app-shell cache for offline loading.
