---
seed_version: '0.1'
id: implement-cmr-find-a-run
title: Implement the CMR Find a Run milestone (/calendar, run details, weather)
objective: >-
  Replace the /calendar and /calendar/[slug] scaffolds with the Owner-approved
  Find a Run experience: hybrid page (hero with weather, upcoming runs,
  interactive Week/Month calendar, first-timer, hills link, community CTA),
  one shared run-detail template, .ics export, share, schedule states, and a
  bounded read-only National Weather Service integration.
status: in-review
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - software-engineering
  - content-publication
  - external-action-integration
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-09T00:00:00.000Z'
updated_at: '2026-11-09T00:00:00.000Z'
---
## Status

**Implemented and validated; PR open for Owner visual review. Not merged, not deployed.** Branch `feat/cmr-find-a-run` (worktree `../cmr-site-find-a-run`) from
`origin/main` at `6701842`. The paused `plan/cmr-join-page` branch and its
uncommitted records in the primary worktree are untouched. Not merged, not
deployed.

## Authorization

The Owner's implementation direction (2026-11-09) approves the UX and visual direction,
the weather feature concept and one bounded read-only public weather-data integration.
The earlier newsletter approval does not apply, so that authorization is recorded as
`.aiom/approvals/implement-cmr-find-a-run-weather-approval.yaml` (status `approved`,
provenance `owner-confirmed`, scoped to server-side NWS reads only). No other
approval is outstanding. Merging and deployment remain Owner-only.

## Weather provider feasibility (NWS)

Checked 2026-11-09 against api.weather.gov: `/points/41.8781,-87.6298` resolves to
grid LOT/76,73 (America/Chicago); `/stations/KMDW/observations/latest` returns
temperature, wind and a timestamp (`textDescription` is sometimes empty, so the
conditions text falls back to the current forecast period and is labelled as a
forecast); `/gridpoints/LOT/76,73/forecast` returns 14 periods with an update time;
`/alerts/active?point=` returns active alerts. No key, no fee. Requires an identifying
User-Agent (sent; no personal data). Cache headers: forecast s-maxage 3600,
observations 300, alerts 5. NWS is suitable; no alternative needed.

## As built

- `/calendar`: hero ("Pick a hill. Show up.", no eyebrow) with the weather module; upcoming list (black, homepage typography, one row per run, cancelled and changed occurrences labelled); Week/Month calendar (grid on tablet and desktop, date-grouped agenda on phones, `?view=&date=` in the URL, browsing limited to today through 12 months ahead, no runs shown before today); "Bad weather. Good hills."; "New here? Good."; Chicago Hills link over a faint contour; community CTA on the tie-dye fill.
- `/calendar/[slug]`: one template for both runs; Hill Beta removed; faint animated contour hero; next real date; Add to calendar (`/calendar/[slug]/ics?scope=occurrence|series`, no-sync note), Get directions (the Owner's exact Google Maps links), Share (native sheet on touch, else copy URL); compact weather. The scaffold placeholder run now 404s.
- Scheduling: `occurrencesWithStatus` adds a presentation status (scheduled, changed time, changed meeting point, cancelled) without changing `occurrencesOf` or the upcoming lists; the homepage is untouched. Run records gained a concise `summary` (Find a Run lists), approved `content`, `durationMinutes` and `directionsUrl`; `description` and `provisional` status are unchanged.
- Weather (`src/lib/weather`, `src/components/weather`): server-side NWS only (KMDW then KORD observation, LOT 76,73 forecast, point alerts), cached 5 min / 30 min / 1 min, 6 s timeout, never throws. Condition picks the glyph; season picks the tie-dye (spring mint, summer peach, autumn mauve and peach, winter lavender and blue). CSS-only motion inside `prefers-reduced-motion: no-preference`; no flashing. Forecast wording is labelled as a forecast when the station gives no conditions. NWS alerts are labelled "Weather alert" and kept apart from organizer cancellations; the UI never says conditions are safe and never cancels anything.
- Map links: both short links resolve to Cricket Hill (41.9629, -87.6440) and Horner Park (41.9595, -87.6957).

## Validation (2026-11-09, macOS, Chromium)

`npm run lint`, `tsc --noEmit`, `npm run tokens:check`, `npm run build`: pass. Vitest: 351 tests, 27 files, pass. Playwright (393 / 768 / 1440): 291 pass, 24 skipped (visual and viewport-specific), including new Find a Run specs (axe with contrast on `/calendar` and both run pages, navigation and URL state, .ics downloads, reduced motion, no horizontal scroll). The suite uses a canned weather fixture (`CMR_WEATHER_FIXTURE`, set only in `playwright.config.ts`); the live NWS API is not called by tests.

## Limitations and follow-ups

- Run times, places and workout details remain provisional until the Owner confirms them; the pages say so.
- `AGENTS.md` is rewritten by `next dev` (heading level); that change was not committed.
- Live NWS behavior was checked by hand once; `textDescription` is often empty, which is why the forecast fallback exists. A vendor-neutral status page for cancellations does not exist; cancellations only appear if added to the run data.
- Visual baselines (`@visual`) were not added for the new pages.
