---
seed_version: '0.1'
id: define-cmr-v1-scope
title: Define Chicago Mountain Runners v1 scope and stack
objective: >-
  Resolve which pages/content ship in the first release and choose an initial
  tech stack/hosting target, before implementation planning begins.
status: complete
stage: research
active_capability: research-discovery
bundle_references:
  - web-ui-experience
  - content-publication
  - external-action-integration
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-08-21T03:50:06.764Z'
updated_at: '2026-08-21T04:20:00.000Z'
---
## Objective

Turn the long-term CMR product vision (calendar, hill profiles, membership, merch, articles, community tracking, club races) into a deliberately small first increment, consistent with the Owner's stated preference to start simple and grow the product over time.

## Context

Two options were proposed to the Owner (page/content scope, tech stack). The
Owner's actual v1 scope decision was broader and more specific than either
proposed option, so it was recorded as given rather than mapped onto a
proposed bucket. See `.aiom/profile.md#v1-scope-decision-2026-08-20` for the
full recorded decision.

Newsletter signup (part of the Owner's scope answer) surfaced a conflict
with the profile's existing `externally_acting: false` /
`consequential_external_action: no` confirmations from Bootstrap. Escalated
back to the Owner per safeguards.md's uncertainty-escalation rule rather
than silently resolving it; Owner confirmed a third-party embedded form,
which the profile has been updated to reflect.

## Notes

- v1 page/content scope: Home, About, Running Calendar/upcoming runs + run
  detail pages, Chicago hills overview + individual hill profiles
  (elevation/repeat info), basic Join/community info, Instagram/Strava
  outbound links, newsletter signup.
- Explicitly out of v1: accounts, RSVP/attendance, member dashboard,
  automated activity tracking, Strava API integration, custom commerce,
  paid membership infrastructure, race functionality.
- Tech stack/hosting: Next.js on Vercel.
- Newsletter mechanism: third-party embedded form (e.g. Mailchimp/
  ConvertKit) — CMR's own systems do not receive or store subscriber PII.
- Follow-on Work Item: `.aiom/work/scaffold-cmr-v1-nextjs.md`.
