---
seed_version: '0.1'
id: implement-cmr-faq-footer-refinements
title: Final FAQ and footer refinements
objective: >-
  Remove the FAQ eyebrow, move the FAQ category links into a sticky section bar
  matching The Science, stack FAQ section headings above their accordions at
  desktop, and recompose the shared footer around a vertical Navigate list.
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

**Complete: merged and deployed (2026-11-09).** PR #16 merged as `218e4b9`. `validate`, `browser` and the Vercel Preview passed on the PR head and CI passed on `main`. Production smoke at 1440, 768 and 393: `/faq` has no eyebrow, the category bar sits under the header bar, the Schedules & Safety anchor lands with its heading below both bars, all 23 questions are present, the footer lists the five Navigate links in order, and there is no horizontal overflow.

## Authorization

Owner direction, 2026-11-09 ("Final FAQ & Footer Refinements"): implement, validate, merge, verify production, close out and clean up.

## Changes

- FAQ: the "GOOD QUESTIONS." eyebrow is removed. The category links moved out of the hero into a sticky section bar directly below it, using the same pattern as The Science's `ScienceNav` (PR #13): measured offset under the header's visible bar, tracks its compact and hidden states, current-section state, sideways-scrolling row with edge fades on narrow screens, native anchors, reduced-motion aware, matching `scroll-padding-top`. Category headings now sit above their accordions at every width (no 4fr/8fr columns).
- Footer: wordmark left opposite a vertical "Navigate" list (Find a Run, Chicago ~~Hills~~ Mtns, About, FAQ, Join the club); one divider; Pause motion with the copyright below it on the left; legal links with the risk statement on the right, right-aligned, risk text constrained to about two balanced lines. Stacks on mobile.
- `buildFooterNav` now includes the Chicago Hills Mtns item (shared with the header's `primaryNav`).

## Coordination with The Science (PR #13)

PR #13 is unmerged and was not touched. Its `ScienceNav` is Science-specific (reads `SCIENCE_SECTIONS`), so this PR adds a generic `src/components/SectionNav.tsx` with the same behavior, taking its items as a prop, and a separate FAQ-scoped block of `scroll-padding-top` rules at the end of `src/styles/cmr.css` (Science's own block is untouched, so the two do not conflict textually). Follow-up, after both merge: have `ScienceNav` use `SectionNav` so there is one implementation.

## Validation

ESLint, build, tokens, Vitest, full Playwright (new `tests/e2e/faq-nav.spec.ts`; footer specs updated to the new composition) and screenshots at 1440, 768 and 393.
