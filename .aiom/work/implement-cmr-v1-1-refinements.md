---
seed_version: '0.1'
id: implement-cmr-v1-1-refinements
title: CMR v1.1 content, UX and functionality refinements (includes a PROPOSED waiver revision)
objective: >-
  Deliver the Owner's v1.1 list on branch feat/v1-1-refinements: Hill suggestion modal, shared Just show up
  copy, Join waiver acknowledgment with a revised (proposed) waiver, Hills on Repeat hero restored, hill-card
  border and divider, FAQ edits and contact link, homepage Group Runs / moon / Hills on pause changes, and the
  founder letter.
status: in_progress
stage: validation
active_capability: software-implementation
bundle_references:
  - software-engineering
  - web-ui-experience
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: owner-approval-of-waiver
current_responsibility: owner
created_at: '2026-11-11T20:00:00.000Z'
updated_at: '2026-11-11T21:00:00.000Z'
---
## Status

Implemented and locally validated on `feat/v1-1-refinements`. **Not merged, not deployed.** Merging is blocked on the Owner's review of the complete waiver text (below): `WAIVER_ENABLED` is `true` on this branch, so merging publishes the waiver page, the footer link and the Join checkbox.

## Authorization

Owner instruction of 2026-11-11 (v1.1 brief): implement on a feature branch, prepare a PR, do not merge or deploy, and do not merge the waiver without explicit approval. No approval artifact was added.

## Waiver: proposed revision (CMR-WAIVER-002)

A proposal for Owner approval and Illinois legal review. It is not legally validated and makes no claim of enforceability. The Owner's Heartbreak Hill sample was **not present in the session**, so the revision is built from the existing CMR text (CMR-WAIVER-001) and the Owner's coverage list only; nothing from any other organization was used.

Material differences from CMR-WAIVER-001 (title was "Participant Waiver and Assumption of Risk"):
1. Title and version: "Participation Waiver and Release of Liability", CMR-WAIVER-002 (the Join record sends the version and an ISO timestamp, as before).
2. Risks: adds stairs and steep inclines, fast descents, roads, curbs, railings, debris, humidity and pedestrians (natural and man-made hazards are named).
3. Responsibilities: adds following reasonable organizer instructions, and a new paragraph that organizers may cancel, move, shorten, modify or stop any activity and ask someone to leave for unsafe conduct.
4. Assumption of risk: "inherent and ordinary" risks (was "inherent and reasonably foreseeable").
5. Release: heading "Release of liability" (was "...for ordinary negligence"); the carve-out for willful/wanton misconduct, gross negligence and intentional harm is kept.
6. New personal-property paragraph (no storage or guarding; no responsibility for loss, theft or damage to the extent Illinois law allows).
7. New **Photography and media** section, kept out of the required acknowledgment: accepting the waiver is not publicity permission; CMR "will ask for your separate permission first". No media checkbox was added to Join.
8. Acknowledgment: states it applies to later activities until a new version replaces it.
9. Severability is its own item with Illinois governing law ("Governing law and severability"); minors: "CMR does not accept minors as participants."
10. Sections renumbered (13); the intro still points to Sections 6 and 7 as the rights-affecting ones.

Open questions for the Owner and a lawyer (also not shown on the page):
- **Legal entity.** The text names no entity (CMR is "an independent, free, informal running community"). Who is the contracting/released party, and should the founder, organizers and volunteers be named as released parties as they are now ("CMR Parties")?
- **Minors.** 18+ only, as before. Is that still the policy (including friends and guests), and is a minor-participation path wanted later?
- **Media.** Confirm CMR will in fact ask for separate permission before publishing identifiable images (the page now says so), and how that consent will be collected. Not bundled into the checkbox.
- **Enforceability.** Whether Illinois law will enforce the ordinary-negligence release for this kind of activity and wording, whether the property and "CMR Parties" language holds, and whether electronic acceptance through a Formspree record is sufficient.
- **Insurance, park permission, organizer qualifications.** None are stated or implied; confirm that stays true.
- **Privacy.** The Privacy Policy sentence about the acceptance record was restored with the new title; the record is a Formspree submission, not an audit trail.

## What changed (by page)

- **/hills:** intro adds the suggestion sentence; "We'd love to hear about it." opens the "Know a hill?" modal (Formspree `mjywvydn`, `form=hill_suggestion`; only the location is required). **Shared:** `ModalDialog` (extracted from `QuestionsDialog`), `QuestionsDialogLink`, `HillSuggestionPanel`, `HillSuggestionLink`.
- **Just show up (home, /hills, /about):** one `JUST_SHOW_UP_COPY` constant; the held/unheld copy pair is gone.
- **/join:** required, unchecked waiver checkbox restored from commit `0d35c7b` (with the 18+ line); waiver page, footer link ("Participation Waiver") and Privacy sentence enabled.
- **/calendar (Hills on Repeat):** hero paragraph and weather widget restored via `FindHero`; Hills on pause unchanged. The page now makes the weather request again.
- **Hill pages:** "Know what you're running" card: 1px `border-border`, divider under the heading.
- **/faq:** heading "Frequently asked Qs."; answers 6.2–6.6 edited; "Questions form" opens the existing Questions dialog.
- **Home:** Group Runs card uses the hill-hero `ContourField` (`HillHeroBackground`); the moon aside is in the About card's gray container (40px vertical padding); the card and the Group runs section show "Hills on pause" (`PAUSE_COPY`), links unchanged.
- **/about:** founder letter replaced; Just show up copy verified.

## Consistency flags (not changed beyond the FAQ)

The new "joining is required for official runs" position contradicts older copy that was edited only where it lived in the FAQ ("Can I bring a friend?", "Can I stop receiving emails?"). Still saying otherwise: the Join page essentials ("Just show up. You don't have to join before attending an organized run." appears only when the hold is lifted) and any run-detail copy ("No registration. Just show up." on run pages, hidden while held). Review before the hold is lifted.

## Validation

Lint, tsc, tokens check, 506 unit tests (41 files), production build and the full Playwright suite (596 passed, 151 skipped by design, 0 failed). Formspree was intercepted in every test; nothing was sent to a live form. Results are in the PR.
