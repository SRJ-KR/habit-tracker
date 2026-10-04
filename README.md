# Daymark

Daymark is a private, single-user productivity and habit tracker built as a static web app. It runs on GitHub Pages without a server, build step, third-party runtime dependencies, or network services.

## Features

- Daily and weekday habits, completion history, streaks, and a seven-day consistency score.
- A five-minute focus timer with a task and two or three small action steps.
- Energy and mood check-ins for morning, afternoon, and evening, with recent and time-of-day averages.
- A technology learning log with topic, duration, date, and plain-text or Markdown notes.
- JSON backup export and validated import.
- Responsive layout and a service-worker-cached app shell for offline use.

## Run locally

Open `index.html` in a browser for a quick preview. For service-worker and installability checks, serve the folder over `http://localhost` or HTTPS; browsers do not enable service workers from `file://` URLs.

## Deploy to GitHub Pages

1. Push the project files to the repository's root branch.
2. In the repository's **Settings → Pages**, choose **Deploy from a branch** and select the root folder.
3. Enable **Enforce HTTPS** after the site is published.

The app uses relative asset paths and does not require a build pipeline.

## Data and schema

The browser stores one JSON document in `localStorage` under `daymark.data`. Its `schemaVersion` is `1.0.0`; separate collections hold habits, habit entries, focus sessions, energy check-ins, and learning logs. UI code works with this document through a small load/save boundary, so persistence can later be moved behind an API without changing the page structure.

Data stays in the current browser profile and is not synchronized or encrypted. Clearing browser storage removes it. Use **Data settings → Export JSON backup** regularly; exported files contain your notes in plain text. Import validates the schema and replaces the current local data.

## Project files

- `index.html` — application markup, styles, and client-side behavior.
- `manifest.json` and `icon.svg` — installable app metadata and icon.
- `sw.js` — versioned, same-origin app-shell cache for offline loading.
