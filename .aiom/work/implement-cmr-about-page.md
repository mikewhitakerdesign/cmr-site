---
seed_version: '0.1'
id: implement-cmr-about-page
title: Implement the CMR About page (/about)
objective: >-
  Replace the /about scaffold with the Figma About page (hero with four
  tie-dye circles, black founder section with two circular photographs,
  simplified "Get high in the city", "Just show up" closing CTA), reusing the
  homepage components and tokens.
status: complete
stage: implementation
active_capability: ui-implementation
bundle_references:
  - repository-versioned-delivery
  - web-ui-experience
  - content-publication
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-09T20:00:00.000Z'
updated_at: '2026-11-10T03:00:00.000Z'
---
## Status

**Complete: merged and deployed (2026-11-10).** PR #20 merged as merge commit **`b9f0643`** (head `fcb45b8`, merged with a head-commit guard). `validate`, `browser` and the Vercel Preview passed on the PR head; the production deployment for `b9f0643` is Ready at https://cmr-site-xi.vercel.app.

**Authorization:** Owner instructions of 2026-11-09: (1) implement the About page through a validated PR with a Preview, no merge; (2) the final-refinement pass, which authorized merging PR #20 only, production verification, this closeout and cleanup (no force-push, no rule bypass). No approval artifact was added; the instructions are recorded here.

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

## Final refinements (2026-11-09)

- Hero: lower circles overlap the black founder section (xl: absolute cluster, bottom circle straddles the boundary; below xl the 2 × 2 grid overlaps it by 40–56px, with matching extra top padding in the founder section); hero bottom whitespace cut; map-image shadow (`0 8px 14px rgba(65,65,65,.28)`) on each circle.
- Motion (`HeroCircles`, `.about-float` / `.about-parallax` in `cmr.css`): slow float plus a ≤ 10px cursor drift on fine-pointer desktops, both only under `html[data-motion="on"]`, so system reduced motion and the footer's Pause motion stop them; the list takes no pointer events at xl.
- Founder photos: equal, separate circles, no stroke, subtle shadow, captions "North Face Headwall, Mt. Athabasca - 2018" and "Mohican 100 Mile Trail Run - 2026"; stacked in the left column from lg, side by side below.
- Signature: temporary text treatment (`Signature` in `FounderStory.tsx`, oblique light type, `aria-hidden`); replace with an approved asset later.
- Footer: `/about` renders the root layout's shared `Footer`, the same as every page (identical computed background `rgb(245,245,245)` and identical markup length on `/`, `/hills`, `/about`). The grey look is its normal `bg-muted` rendering; Figma's About frames drew it mint. No change made.
- After the merge with `main` (PRs #11–#21): `main`'s `JustShowUp` (permit-hold copy, Join tooltip, "Join the club") and `lib/tints` replaced the first-pass `JustShowUp` props and `tie-dye.ts`, so the About CTA now matches the homepage exactly (its copy follows the site's hold state, not the Figma sentence).

## Outcome

**CI.** PR head `fcb45b8`: `validate`, `browser`, Vercel Preview passed. Local: lint, tsc, build, Vitest 467 (2 skipped), Playwright 509 passed.

**Production** (https://cmr-site-xi.vercel.app, built from `b9f0643`): `/about` 200 at 1440, 768 and 393 with no horizontal overflow, no console errors, both founder photos loaded, four circles, one shared footer, mailto and `/hills` links present. `/`, `/hills` 200.

**Cleanup.** The implementation worktree `../cmr-site-about`, local `feat/cmr-about-page` and the remote `feat/cmr-about-page` are removed; this closeout branch is removed after its PR merges. Not touched: the primary worktree (`plan/cmr-join-page` and its uncommitted records) and other branches.

## Follow-ups (Owner; not blocking)

- Higher-resolution founder photos (sources are 480×640 and 912×686).
- Replace the text signature with an approved asset.

## Members correction (2026-11-10)

The final-refinement merge (PR #20) did not carry the Owner's Members-section instructions. A focused correction followed: **PR #23**, merge commit **`a90a5cb`** (head `fa62687`, head-commit guard; `validate`, `browser` and the Vercel Preview passed).

- Both photographs removed from the black founder section (copy, signature, attribution, email kept; heading left and story right from lg, stacked below). The Mt. Athabasca photo and its caption are deleted from the repository.
- New white "Members" section directly below it (`src/components/about/Members.tsx`): the founder with the Mohican photo (`public/about/founder-ultra.jpg`), "Michael Whitaker" / "Founder & Director", and a matching light-gray circle with a darker-gray person icon (`UserIcon`), "Are you the next member?" and a "Join the club" ArrowLink to `/join`. Two columns at every width, no overlap, map-image shadow, display heading, no backend.
- Production (built from `a90a5cb`, Ready): `/about` 200 at 1440, 768 and 393; no horizontal overflow or console errors; no images in the founder section; Members follows it; footer count 1; `mailto:` and `/join` links present. Local: lint, build, Vitest 467 pass.
- Cleanup: worktree `../cmr-site-about2` and branch `feat/cmr-about-members` (local and remote) removed; this closeout branch is removed after its PR merges. The primary worktree and its uncommitted records are untouched.
