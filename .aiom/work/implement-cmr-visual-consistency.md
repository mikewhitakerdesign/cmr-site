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
status: complete
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-10T00:00:00.000Z'
updated_at: '2026-11-11T02:30:00.000Z'
---
## Status

**Complete: merged and deployed (2026-11-10, UTC 2026-11-11).** PR #25 merged as merge commit **`fb32379`** (head `c8846be`, merged with a head-commit guard). `validate`, `browser` and the Vercel Preview passed on the PR head (one `browser` timeout in a contrast test on the first run was re-run and passed); CI on `main` at `fb32379` passed (`validate`, `browser`); the production deployment (https://vercel.com/mikewhitaker-projects/cmr-site/7SKUPRwStBmEQVPACBWRsvezK2Eu, built from `fb32379`) is Ready at https://cmr-site-xi.vercel.app.

**Authorization:** Owner instructions of 2026-11-10: the visual-consistency scope and its successive refinements (implement through PR #25, no merge), then the final instruction to disable the waiver, merge PR #25 after validation, complete the AIOM closeout and clean up branches and worktrees. No approval artifact was added; the instructions are recorded here.

## Decisions

- Heading roles live in `src/lib/headings.ts`: `displayXL` 209 (homepage hero), `displayLarge` 128 (hill detail, Join, /calendar, /hills), `pageH1` 100 (About, The Science), `impactH2` 96 (was `displayHeading`), `standardH2` 72. Semantic levels are unchanged.
- About founder heading and The Science section headings moved to Standard H2 (was 84 and 80 desktop).
- The photograph is shown in colour as supplied (the mockup's grayscale was not applied: "preserve its original appearance").
- Out of scope, left as is: homepage statement headings, FAQ and legal H1s, run detail H1, the unused `public/about/founder-ultra.jpg`.

## Launch-readiness additions (2026-11-10)

- Join: "Join the club." hero, "Count me in" button and "Count me in." form heading (sentence case). The button is disabled until first name and a valid email are in place; `onSubmit` still validates and focuses the first problem. (A combined waiver checkbox was built and then disabled; see below.)
- Submission stays on Formspree `xrppvnln` with the original fields.
- Shared hero top padding `src/lib/hero-spacing.ts` (56 / 72 / 96): home, /hills, /about, /the-science, /join, Terms, Privacy, Participation Guidelines, the waiver and run detail pages. Exceptions kept: /calendar and hill detail pages. The homepage action row margin was reduced by the headline's shift so the buttons and card stay where Figma puts them.
- New route `/participant-waiver` (draft; disabled, see below).

## Waiver disabled before merge (Owner direction, 2026-11-10)

The waiver is pending attorney review and is not part of the public MVP. `WAIVER_ENABLED = false` in `src/lib/waiver.ts`: `/participant-waiver` returns 404 (still `noindex` if enabled), the footer link is hidden, the Join form has no checkbox (an "By joining, you confirm that you are at least 18 years old." statement stands in; the "Count me in" button enables when name and email are valid), and no waiver fields (`waiver_accepted`, version, timestamp) are sent. `age_18_plus=yes` is still sent. The Privacy sentence about waiver acceptance was removed. The draft text, version `CMR-WAIVER-001` and `waiverRecord()` remain in the repository for a future initiative; the checkbox implementation is in commit `0d35c7b`.

## Open items for Owner and Illinois attorney review (not shown publicly)

1. Whole document is an original draft informed by RRCA guidance and Illinois case law on exculpatory agreements; it is not attorney-approved.
2. Section 7: release of ordinary negligence. Illinois construes exculpatory clauses strictly and requires clear language; confirm wording, the carve-out for willful and wanton conduct and gross negligence, and whether to name the released parties more specifically.
3. Releasees are CMR, its founder, organizers, volunteers and their agents. No entity is named because none is stated to exist; confirm whether to name Michael Whitaker individually and whether any park district or landowner should be included (not assumed).
4. Section 8: no insurance is stated; confirm that the sentence about participants relying on their own insurance is acceptable and that nothing here implies coverage.
5. Section 9 and electronic acceptance: confirm that a checkbox plus a Formspree record (name, email, version, ISO timestamp) is an acceptable form of assent, and whether a typed name, IP address or user agent should also be captured.
6. Section 10: Illinois governing law only; no venue or arbitration clause added. Confirm.
7. Effective date is a placeholder ("to be set when approved"); set it and remove the draft note and `robots: noindex` on approval.
8. Severability and "heirs" language in Section 7: confirm.
9. Minors: the waiver excludes under-18s; confirm that no guardian pathway is wanted.

## Limitations of the acknowledgment record

Formspree stores submissions per its plan and retention settings; it is not an immutable audit trail and the timestamp is the visitor's browser clock (client-side, not server-stamped). The page can be bypassed by a direct POST to the public form ID, which the client-side checks cannot prevent. Durable options for later: a small server endpoint that validates, stamps server time, stores the waiver text hash, version, IP and user agent, and sends a confirmation email; or an append-only store (database or object storage) written by that endpoint. Not built in this PR.

## Outcome

Delivered in PR #25: named heading roles (Display XL / Large, Page H1, Impact / Standard H2); "Hills on Repeat" and "Hills on Hills" navigation with tooltips; `/calendar` and `/hills` hero headings ("Hills on repeat.", "Hills on hills on hills." on two lines from lg); About circles in a CSS grid with the founder-section overlap and no shadows, the "Hills on hills on hills." card with the Owner's black-and-white photograph, the founder signature (Owner asset, white ink, transparent) and regular-weight body copy; `/calendar` closing sections removed; The Science Figure 3 replaced with the Owner's artwork and The Science opening at the top (`data-scroll-behavior` on `<html>`); the shared hero top padding (`src/lib/hero-spacing.ts`); Join capitalization ("Join the club.", "Count me in").

**Deferred (waiver):** the Participant Waiver is not part of the MVP. The draft (`CMR-WAIVER-001`) and `waiverRecord()` stay in the repository (`src/content/legal.ts`, `src/lib/waiver.ts`) behind `WAIVER_ENABLED = false`; `/participant-waiver` returns 404 and is linked nowhere; the Join form has no checkbox and sends no waiver fields. A future initiative needs: attorney review of the open items above, an effective date, removal of the draft note and `noindex`, `WAIVER_ENABLED = true`, the Join checkbox restored (see commit `0d35c7b`) and the Privacy sentence restored.

## Production verification (https://cmr-site-xi.vercel.app, Ready, built from `fb32379`)

HTTP 200 for `/`, `/about`, `/calendar`, `/hills`, `/the-science`, `/join`, `/hills/cricket-hill`, `/calendar/cricket-mtn-repeats`, `/privacy`; `/participant-waiver` returns **404**. A real-browser pass at 393 and 1440 found no horizontal overflow and no console errors, the expected `<h1>` on each page, and no waiver link on the pages checked. On `/join` there are no checkboxes, "Count me in" starts disabled and enables once name and email are valid, and a submission with Formspree mocked (production Formspree was not contacted) posts only `first_name, email, _gotcha, _subject, age_18_plus`: no waiver fields.

## Closeout

Feature branch `feat/cmr-visual-consistency` and its worktree are removed after this closeout merges. No follow-up is required for the merged work; the waiver initiative above is the only deferred item.
