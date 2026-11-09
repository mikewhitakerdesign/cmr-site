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
status: active
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - software-engineering
  - content-publication
  - external-action-integration
authority_requirement: owner-authorization-satisfied
validation_state: not-started
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-09T00:00:00.000Z'
updated_at: '2026-11-09T00:00:00.000Z'
---
## Status

In progress. Branch `feat/cmr-find-a-run` (worktree `../cmr-site-find-a-run`) from
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
