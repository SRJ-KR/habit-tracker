---
name: streak-habit-development
description: Implement and verify focused features in the Daymark/Streak single-file habit tracker, following its schema, accessibility, migration, and quality-gate conventions.
---

# Streak habit development

Use this skill when changing the Daymark/Streak habit tracker, especially its habit routines, cues, completion rules, streaks, reviews, insights, or local data schema.

## Project boundaries

- The application is a static, single-user GitHub Pages app. Its UI, CSS, and vanilla JavaScript live in `index.html`; browser persistence is LocalStorage.
- Do not introduce a framework, build step, runtime dependency, external font, analytics, server requirement, or remote asset.
- Keep changes scoped to the requested step. Preserve unrelated code and current UI behavior.
- The current data schema is version `2`. The existing architecture is Daymark's data/load/save flow, not a separate Streak v1 `Store`/`A`/`TABS` architecture; do not recreate those abstractions without an explicit request.
- Read `AGENTS.md`, the relevant parts of `index.html`, tests, and `QUALITY_LOG.md` before editing.

## Product behavior

- Optimize for making it easy to start, using small actionable steps and clear implementation cues.
- Keep copy calm, neutral, and non-shaming. A missed day must not trigger guilt or punishment.
- Rewards must be predictable and transparent. Do not introduce random rewards, leaderboards, sound spam, or push-notification nagging.
- Keep mobile layouts usable at 360px without horizontal page scrolling. Retain the existing inherited font family, theme variables, visible focus behavior, and reduced-motion support.

## Data and safety rules

- Store calendar dates as local `YYYY-MM-DD` keys using the existing local-date helpers; never use `toISOString()` to create a day key.
- Treat LocalStorage and imported JSON as untrusted. Validate records before use, and render user-controlled strings with `textContent`/DOM nodes rather than interpolating them into HTML.
- Keep exports compatible with `{app:"streak", schemaVersion, exportedAt, data}`. Imports must migrate supported older versions forward and clearly reject newer unsupported versions.
- For a schema change, increment `SCHEMA_VERSION`, add an idempotent forward migration in `MIGRATIONS`, update `COLS` defaults/required fields/documentation, validate the new data, and preserve existing user data.
- Add fields to defaults for both migrated records and newly created records where applicable.
- If an app-shell asset changes, increment the cache name in `sw.js`; keep its same-origin allowlist strict.

## Change and quality workflow

1. Confirm the requested step and inspect all affected surfaces before editing.
2. Implement only that step, keeping the app functional on GitHub Pages.
3. Add or update focused tests in `tests/quality-gate.test.mjs` for structural behavior. For browser-visible flows, verify the affected interaction in a browser when available.
4. Update `QUALITY_LOG.md` with the change summary and exact checks. Run `npm run gate` and `git diff --check`; resolve failures and rerun the gate before proceeding.
5. Do not commit unless the gate passes. When committing is requested or part of the active delivery workflow, use a concise message and include the repository's required Copilot co-author trailer.
6. Deliver one requested feature step at a time. Summarize the diff and test results, then wait for the user's “continue” before starting the next step.

## Relevant files

- `index.html` — application UI, behavior, schema, validation, migrations, and persistence.
- `tests/quality-gate.test.mjs` — dependency-free Node tests.
- `QUALITY_LOG.md` — verification history that must be updated before a code commit.
- `sw.js` — offline app-shell cache.
- `README.md` and `AGENTS.md` — project usage and engineering constraints.
