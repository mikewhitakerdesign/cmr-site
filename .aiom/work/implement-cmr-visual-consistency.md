---
seed_version: '0.1'
id: implement-cmr-visual-consistency
title: Final visual and brand consistency refinements (heading roles, nav labels, About, Figure 3)
objective: >-
  Standardize the CMR heading hierarchy into named visual roles, rename two
  navigation items with tooltips, retitle /calendar and /hills, rebuild the
  About hero circles and replace the About Members and hills sections with one
  editorial card, standardize hero-support text color, and swap Science Figure 3
  for the Owner's artwork.
status: in-progress
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
authority_requirement: owner-authorization-satisfied
validation_state: pending
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-10T00:00:00.000Z'
updated_at: '2026-11-10T00:00:00.000Z'
---
## Status

In review on one PR; **not merged**. Authorization: Owner instruction of 2026-11-10 (implement through a validated PR, no merge, no production deploy, no post-merge closeout yet).

## Decisions

- Heading roles live in `src/lib/headings.ts`: `displayXL` 209 (homepage hero), `displayLarge` 128 (hill detail, Join, /calendar, /hills), `pageH1` 100 (About, The Science), `impactH2` 96 (was `displayHeading`), `standardH2` 72. Semantic levels are unchanged.
- About founder heading and The Science section headings moved to Standard H2 (was 84 and 80 desktop).
- The photograph is shown in colour as supplied (the mockup's grayscale was not applied: "preserve its original appearance").
- Out of scope, left as is: homepage statement headings, FAQ and legal H1s, run detail H1, the unused `public/about/founder-ultra.jpg`.

## Closeout

Pending Owner approval of the Preview.
