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

## Closeout

Pending Owner approval of the Preview.
