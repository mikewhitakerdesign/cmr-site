---
seed_version: '0.1'
id: implement-cmr-final-site-polish
title: Final site polish: run access, footer and hill map
objective: >-
  Lift the temporary permit-pending website restriction for private development
  and review, rebuild the shared footer as wordmark, divider and two columns,
  and give the "Find what you've been looking for" map the run-detail shadow.
status: complete
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

**Complete: merged and deployed (2026-11-09).** PR #14 merged as `95fecae`. `validate`, `browser` and the Vercel Preview passed on the PR head, and CI passed on `main`. Production smoke: `/`, `/calendar`, `/calendar/horner-hell-repeats` and `/hills/cricket-hill` return 200, no "on hold" copy on `/calendar`, and the series and occurrence `.ics` links return 200.

## Authorization

Owner direction, 2026-11-09: remove the website restriction because CMR is still in private development (public domain not connected, no members invited, no public advertising of organized runs). Owner also directed the footer and map refinements.

## Changes

- `OFFICIAL_RUNS_ON_HOLD` is now `false` in `src/lib/permit-hold.ts`. This is the single switch; the hold components, copy and tests stay, so setting it back to `true` re-applies the hold. `/calendar`, run detail pages, `.ics` downloads and the homepage and hill-page run references are back as built.
- Footer (no newsletter): wordmark in the upper right, one 1px divider, then left column (main links, Pause motion, copyright) and right column, right-aligned (legal links, risk notice). Mobile keeps the stacked order. All footer text links share one type, color, hover and focus treatment.
- The "Find what you've been looking for" map (hill detail pages; there is no map on the homepage) drops its 1px border and uses the run-detail map shadow.

## Operational follow-ups before public launch (still open)

Lifting the website restriction is **not** a statement that CMR has Chicago Park District permission, liability insurance or formal authorization to hold recurring events. These remain open and must be resolved before the domain is connected, members are invited or runs are advertised:

1. Park District permit requirements for organized group runs at each meeting point.
2. Liability insurance for the club's organized runs.
3. Any formal authorization needed for recurring events.

The site makes no claim of approval or affiliation. Re-apply the hold with the one flag if the Owner decides to go public before these are resolved.

## Validation

ESLint, tsc (build), tokens check, build, Vitest, full Playwright (hold-only specs skip while lifted; their logic is still covered by the `held` parameter unit tests) and screenshots at 1440, 768 and 393 with no horizontal overflow.
