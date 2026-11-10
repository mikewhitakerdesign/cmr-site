---
seed_version: '0.1'
id: implement-cmr-about-page
title: Implement the CMR About page (/about)
objective: >-
  Replace the /about scaffold with the Figma About page (hero with four
  tie-dye circles, black founder section with two circular photographs,
  simplified "Get high in the city", "Just show up" closing CTA), reusing the
  homepage components and tokens.
status: active
stage: implementation
active_capability: ui-implementation
bundle_references:
  - repository-versioned-delivery
  - web-ui-experience
  - content-publication
authority_requirement: none
validation_state: passed
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-09T20:00:00.000Z'
updated_at: '2026-11-09T20:30:00.000Z'
---
## Status

Implemented on `feat/cmr-about-page` (worktree `../cmr-site-about`), awaiting Owner
review of the Vercel Preview. Not merged, not deployed. No post-merge closeout yet.

## Decisions

- Figma 1:4 (About) read via the Figma connector; circle copy taken from Figma.
- Hero circles reuse the club-totals tie-dye (`tintVars` moved to `src/lib/tie-dye.ts`, `cmr-tie-dye`).
- Closing CTA reuses `JustShowUp` (new optional `copy` / `joinLabel` props; homepage unchanged).
- Founder photos are the Owner's unedited originals (`public/about/`), cropped by CSS only.
  Source files are small (480×640, 912×686), so the larger circle is mildly upscaled.
- "Get high in the city" is one sentence plus an `/hills` ArrowLink; the Figma five-row list is omitted.
- Closing CTA body copy carries the same accepted contrast exception as the homepage (PR #3).

## Validation

lint, vitest (222), production build and Playwright e2e (incl. axe on /about) pass; no horizontal overflow at 393/768/1024/1280/1440.
