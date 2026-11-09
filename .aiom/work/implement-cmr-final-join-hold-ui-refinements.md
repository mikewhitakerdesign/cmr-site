---
seed_version: '0.1'
id: implement-cmr-final-join-hold-ui-refinements
title: Final Join, permit-hold and shared UI refinements
objective: >-
  Seven Owner-directed refinements: the Find a Run permit hold as a glass panel
  over the real page headline, the cropped hill contour art, a balanced
  newsletter-free footer, a one-line Join form subtitle, a pure-white nav Join
  button, and a shared "Join the club" tooltip.
status: in_progress
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - software-engineering
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-09T00:00:00.000Z'
updated_at: '2026-11-09T00:00:00.000Z'
---
## Status

Implemented on `feat/cmr-final-join-hold-ui` from `origin/main` at `2f3a176`, one PR. Merge, production verification and closeout are recorded in the closeout section when they happen.

## Authorization

Owner direction (2026-11-09): all scoped changes approved; merge, production verification, closeout and cleanup authorized once checks pass. No new external service, dependency or approval artifact.

## As built

1. **Permit hold** (`src/components/calendar/PermitHold.tsx`, `FindHero` `held` mode): the black contour hero is gone. The real Find a Run headline ("Pick a hill. Show up.") is the backdrop; the notice is a wider centred glass panel (white 70%, 6px blur, soft shadow). The backdrop is `inert`, `aria-hidden`, headline only: no intro, no weather panel (so no weather request), no dates, runs or actions. No dismiss control. `OFFICIAL_RUNS_ON_HOLD` and its routing, `.ics` 404 and static-param restrictions are untouched; actions are Explore the hills and Join the club.
2. **Contour art** (`HillContourArt.tsx`): the irregular outer rings overran the fixed 240 box and clipped. The SVG now fits a square viewBox to the drawing's real bounds plus padding; same 1px line, same size classes, all hills.
3. **Footer** (`Footer.tsx`): the Join work had left the wordmark alone in a layout designed for newsletter plus wordmark (the newsletter was hidden for v1 with no replacement, leaving an empty half). Without the newsletter, on desktop the link row, with Pause motion inline, now takes the left half beside the wordmark, with one hairline above the legal row. Tablet and mobile keep the previous stacking. One copy of each part, placed by grid area. No signup form, no routes or legal links changed; the newsletter variant still renders if configured.
4. **Join subtitle** (`/join`): one line from `xl` (copy unchanged), wrapping naturally below.
5. **Nav Join button**: pure white at rest (the current-page light-grey ghost fill is removed), 1px black outline, black hover.
6. **Tooltip** (`src/components/Tooltip.tsx`, `JOIN_TOOLTIP`): "No fees. No commitments. Lots of elevation." CSS-only, no dependency; hover (300 ms delay, hover devices only) and keyboard focus; `pointer-events-none`; linked with `aria-describedby`; not rendered below `sm`. Applied to the header, hold, homepage hero, Just show up, home hold links, hill-page and Find a Run community Join CTAs. The footer text link and the form's submit button are not CTAs and are unchanged.

## Validation

Lint, `tsc`, tokens check, build, Vitest (418) and Playwright (393 / 768 / 1440) pass, with new unit and e2e coverage for the hold backdrop and restrictions, contour bounds, footer layout, nav fill, subtitle, and tooltip hover, focus and description. Screenshots at 1440, 768 and 393 reviewed; no horizontal overflow on `/calendar`, `/join`, hill pages, `/`, `/hills`, `/about`.
