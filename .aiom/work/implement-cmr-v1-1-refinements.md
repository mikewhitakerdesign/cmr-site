---
seed_version: '0.1'
id: implement-cmr-v1-1-refinements
title: CMR v1.1 content, UX and functionality refinements (includes a PROPOSED waiver revision)
objective: >-
  Deliver the Owner's v1.1 list on branch feat/v1-1-refinements: Hill suggestion modal, shared Just show up
  copy, Join waiver acknowledgment with a revised (proposed) waiver, Hills on Repeat hero restored, hill-card
  border and divider, FAQ edits and contact link, homepage Group Runs / moon / Hills on pause changes, and the
  founder letter.
status: complete
stage: implementation
active_capability: software-implementation
bundle_references:
  - software-engineering
  - web-ui-experience
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-11T20:00:00.000Z'
updated_at: '2026-11-11T21:00:00.000Z'
---
## Status

Owner approved on 2026-11-11 (final reconciliation brief): the v1.1 changes, CMR-WAIVER-002 for publication, and PR #31's merge after validation. **Complete: merged and verified in production (2026-11-11).**

## Authorization

Owner instructions of 2026-11-11: (1) the v1.1 brief (feature branch, PR, no merge without approval); (2) the final reconciliation brief approving the v1.1 changes and the CMR-WAIVER-002 approach, and authorizing the commit, push, merge of PR #31 after validation and post-merge cleanup. **Owner approval is not an Illinois attorney's opinion.** The waiver has not been reviewed by counsel and no enforceability is claimed; outside legal review remains recommended but did not block the merge. No approval artifact was added; the instructions are recorded here.

Approved decisions: no legal entity is named (informal, volunteer-led; released parties are CMR, its founder, organizers and volunteers, qualified as not attorney-validated); 18+ only, no minor or guardian process; media permission stays separate from the required acceptance (an operating commitment, no new consent form in v1.1); ordinary-negligence release qualified by Illinois law; effective date November 11, 2026 (the merge date); version stays CMR-WAIVER-002; draft notices removed from the page. The waiver page stays `noindex` and out of the sitemap (not changed).

## Membership policy and copy reconciliation

Policy: joining is free and required for official CMR weekly and group runs; membership is not required to explore or run Chicago's hills independently; official runs remain on pause. Updated: Join page (hero line, essentials, form note), Terms (membership and eligibility), Privacy (Your choices, club-updates paragraph; stopping emails does not by itself keep someone eligible), FAQ (unsubscribe answer), run detail copy and first-timer points ("No registration"), run descriptions, and the Hills on Repeat description and hero. Privacy, Terms and Guidelines "Effective" dates are now November 11, 2026. Formspree handling of signups and unsubscribe requests is unchanged.

## Waiver: CMR-WAIVER-002 (history of the proposal)

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

## Delivery

PR #31 merged as merge commit **`b8f0c95`** (head `eb85751`, merge-commit method, head-commit guard). On the final head `validate`, `browser` and the Vercel checks passed (local: lint, tsc, tokens check, build, 506 unit tests, Playwright 596 passed / 151 skipped by design / 0 failed). Production (`https://www.chicagomountainrunners.com`, read-only requests, no Formspree submissions): `/`, `/hills`, `/calendar`, `/faq`, `/about`, `/join`, `/participant-waiver`, `/privacy`, `/terms` return 200; the waiver shows CMR-WAIVER-002 and "Effective November 11, 2026"; `/calendar` shows the hero paragraph, weather and "Hills on pause"; the FAQ heading is "Frequently asked Qs."; the Join checkbox links the waiver. Hills on pause remains in effect; no membership gate or authentication was added. The two Formspree forms stay separate (Join `xrppvnln`, hill suggestion `mjywvydn`).

One miss found in production: the waiver page's meta description still ended "Draft for review." It is removed in the closeout PR, with a regression assertion.

## Remaining recommendation (nonblocking)

Independent Illinois attorney review of CMR-WAIVER-002 (entity and released-party wording, ordinary-negligence release, property and media provisions, electronic acceptance) is still recommended. It has not happened and is not claimed. The waiver page remains `noindex` and unlisted in the sitemap, by choice.
