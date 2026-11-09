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
status: complete
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - software-engineering
  - content-publication
  - external-action-integration
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-09T00:00:00.000Z'
updated_at: '2026-11-09T23:59:00.000Z'
---
## Status

**Complete: merged (2026-11-09).** PR #6 was merged as merge commit **`57be02e`** (branch head `df3a02a`). GitHub CI `validate` and `browser` passed on the PR head and on `main` after the merge (run 42678392694). Vercel built the merge commit and reported "Deployment has completed"; production (https://cmr-site-xi.vercel.app) smoke-checked after the merge: `/`, `/calendar`, both run pages, `/hills`, `/hills/cricket-hill` and `/hills/mt-trashmore` return 200; the placeholder run returns 404; both run pages show the exact Google Maps links, the exact-pin static maps (200 image/jpeg), four What to expect icons, the compact weather block and working `.ics` series downloads; hill About headings carry the tie-dye word; the footer Pause motion control is present; the live NWS weather panel renders. The record below is as of the last pre-merge review.

(Superseded status line:) Branch `feat/cmr-find-a-run` (worktree `../cmr-site-find-a-run`) from
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

## Final MVP visual refinements (2026-11-09, Owner-approved, same branch and PR)

Scope: Run Details (hero contour 25% slower, What to expect icons, exact-pin static maps with a minimal weather block, tie-dye metadata circles); Chicago Hills (specs box with decorative contour art and the new headings "The hill at Montrose." / "The hill at James Park.", map matched to its column, larger and sparser hero contours in neutral 500, grey tie-dye TBD circles, tie-dye word in "More hills on repeat."); a global Pause / Resume motion control in the footer (`src/lib/motion.ts`: pre-paint `data-motion`, choice in localStorage, system reduced motion respected, consumed by CSS, the WebGL ContourField and the Odometer). The motion toggle is the only addition to shared chrome.

Intentionally deferred to post-MVP (Owner decision, 2026-11-09): **South Side hills, including the Beverly incline.** One targeted search found only unconfirmed leads (Longwood Drive near 105th Place, Ridge Park), no named, sourced incline, and no repository record of any South Side candidate. Per the Owner's rule no hill was added or guessed. Owner: no further geographic research now; add only verified locations after the MVP.

Validation: lint, tsc, build, 364 Vitest, 315 Playwright (393 / 768 / 1440) pass, including new final-pass specs (motion pause and persistence across navigation and reload, reduced-motion default and opt-in, WebGL stopped, map pins, circles, hill layout, axe with contrast). Pin coordinates are those the Owner's short links resolve to; the static maps are built by `scripts/assets/build-hill-maps.mjs --runs`.

Heading correction (Owner, 2026-11-09): the tie-dye word belongs on "hill" / "mountain" in each hill's About heading (e.g. "The hill at Montrose."), not on "More hills on repeat."; moved, using the same `TieDyeWord`.

## Closeout (2026-11-09)

- Merged by merge commit (squash was not used; earlier milestones also used merge commits). No protections bypassed.
- Intentionally deferred to post-MVP, by Owner decision: South Side hills including the Beverly incline (add only verified locations; no further research now); Playwright `@visual` baselines for the new pages; a status page for organizer cancellations (cancellations only appear if added to the run data).
- Release dependencies unchanged: run times, places and workout details remain `provisional` until the Owner confirms them; NWS is the only external data source and is informational only.
- Cleanup: local worktree `../cmr-site-find-a-run` and local branch `feat/cmr-find-a-run` removed after confirming they were merged; the remote branch was left in place pending Owner direction, as for earlier milestones. `plan/cmr-join-page`, its uncommitted files, PR #5 and every other branch were not touched.

## Map and weather card refinement (2026-11-09, Owner-authorized, PR #9)

Follow-up delivered after the original merge; the PR #6 record above is unchanged. PR #9 (`feat/cmr-run-map-refinement`) was merged as **`4ea54a9`**; GitHub CI `validate` and `browser` and the Vercel Preview passed on its head, and `main` built and deployed.

- Maps: the run maps are rebuilt from OpenStreetMap zoom-18 tiles (finer detail than z17, nothing upscaled), 960x640, high-quality WebP (about 51 KB and 80 KB, down from 137 and 200 KB JPEG), by `scripts/assets/build-hill-maps.mjs --runs`. Built once under the OSMF tile policy; attribution unchanged. No free source offers true 2x labels (OSM and CARTO `@2x` both returned 256 px tiles), so Retina text remains slightly soft: the Owner accepted this for the MVP and no other provider, key or vector pipeline was pursued.
- Exact pins unchanged: Cricket Mtn Repeats 41.962864, -87.64403; Horner Hell Repeats 41.959459, -87.69566; the same Google Maps directions links. The pin now sits at 38% / 64% of the image (`pin.anchor` in `src/lib/runs.ts`) so it stays clear of the weather card.
- Layout: 3:2 map card, no border, subtle close shadow; image-only 1.05 hover zoom (450 ms) active only under `html[data-motion="on"]` on hover devices (Pause motion and reduced motion disable it). The existing `WeatherCompact` now floats over the map's upper-right corner (across the top edge on mobile) with a deeper shadow; alerts, unchecked-alerts, unavailable and long-text states stack below the map so safety content is never clipped or over the pin. No new weather calls.
- Validation: lint, tokens check, build, Vitest, full Playwright (393 / 768 / 1440) pass, including placement unit tests and e2e geometry and hover / Pause-motion specs. Screenshots at 1440, 768 and 393 reviewed for normal and storm-alert states, locally and on production (both run pages: 200, WebP map, exact directions links, floating card, 1.05 hover zoom, no horizontal overflow).
- Known limit: on a phone the z18 map labels are small (the image is shown at about 345 px).
