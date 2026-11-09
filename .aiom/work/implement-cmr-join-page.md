---
seed_version: '0.1'
id: implement-cmr-join-page
title: Plan and implement the CMR Join the club page (/join)
objective: >-
  Replace the /join scaffold with a simple, welcoming signup experience for an
  informal, no-fee running club, delivered through the already-selected
  Formspree form and built on the shared UI, MWDS tokens and conventions
  established by the homepage (PR #3). Copy, flow, fields, visual hierarchy and
  the confirmation experience are Owner-directed; this Work Item records the
  evidence, a recommended approach, and the decisions the Owner must make
  before implementation.
status: in-review
stage: implementation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - content-publication
  - external-action-integration
authority_requirement: owner-authorization-required
validation_state: passed
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-08T22:00:00.000Z'
updated_at: '2026-11-09T21:00:00.000Z'
---
## Status

**Implemented and validated for the portions that do not depend on missing Owner inputs; PR open for Owner review. Not merged, not deployed. No real Formspree submission was made.**

Branch `feat/cmr-join-faq-policies` (worktree `../cmr-site-join`), **stacked on PR #6 (`feat/cmr-find-a-run`)**; the PR is opened against that branch. PR #6, `plan/cmr-join-page` and its uncommitted records in the primary worktree are untouched.

**Merge order (Owner direction, 2026-11-09):** 1) PR #6 merges to `main` (Owner approval). 2) This PR is retargeted or rebased onto `main`, validation is rerun, and work stops for Owner approval before merge. This PR must not merge before PR #6.

### Publication blockers (content left unpublished)

| # | Blocker | State |
|---|---|---|
| B1 | Owner-approved **Website Terms, Privacy Policy and Participation Guidelines** drafts were not supplied | `/privacy`, `/terms`, `/participation-guidelines` exist as **"in review" shells** (no policy text, `noindex`, footer links hidden). Text goes in `src/content/legal.ts`. The Join form links to `/privacy`, so **Join must not go live until Privacy is published** |
| B2 | **FAQ** content (GPT planning conversation) was not supplied | Not built. No FAQ route or content exists. Not invented |
| B3 | **CMR-JOIN-001** decision record was not found in the repo | The approved membership model in the brief was used as stated |
| B4 | **Unsubscribe mechanism** is unspecified | Pages say "You can unsubscribe at any time" (approved decision) but nothing states how. Owner to define before launch (manual roster) |
| B5 | Privacy claims depend on **hosting settings** not in the repo | See audit: Vercel logging/analytics, Formspree plan, retention |
| B6 | **Permit hold** stays on until the Owner authorizes lifting it | Flag `OFFICIAL_RUNS_ON_HOLD` in `src/lib/permit-hold.ts` |

## Implementation plan and affected files

**Permit-pending hold** (one flag, `src/lib/permit-hold.ts`). While true: `/calendar` shows the hold notice (`components/calendar/PermitHold.tsx`, translucent panel over the contour field, no agency name or logo, static, not an alert); `/calendar/[slug]` redirects to `/calendar`, is not generated and is `noindex`; `/calendar/[slug]/ics` returns 404; homepage next-run card, "Upcoming runs" and "Just show up" copy use hold variants; hill pages' "Run it with us" shows the hold variant; the directory lists no weekly run. The Chicago Hills directory and hill pages stay open. The held next-run card keeps the run card's footprint so the hero layout does not shift when the hold is lifted. `tests/lib/permit-hold.test.ts` scans the source and **fails if any page or component reads run data without referencing the hold** (three reviewed exceptions are listed in the test). Held content is hidden, not deleted.

**Join** (`src/app/join/page.tsx`, `components/join/JoinForm.tsx`, `lib/join.ts`, `lib/validation.ts`): approved hero copy verbatim; "The basics" (every line is an approved membership decision); form with first name, email address, required unchecked 18+ box; honeypot and a hidden `_subject` ("CMR Join signup") so Join mail is distinguishable from Questions mail; validation, linked errors, first-invalid focus, "Joining…" disabled state plus a synchronous double-submit lock, entries kept on error, success only after Formspree confirms, inline "YOU'RE IN." (focused, announced, no personal data echoed) with an "Explore the hills" link. Endpoint `xrppvnln` only; the Questions form (`mwlljgld`) is untouched and a test asserts they differ. `Field` and the email check were extracted from `QuestionsWidget` with no behavior change (its 10 tests unchanged and passing). The age box is not described as a waiver and a test asserts that.

**Legal shells** (`src/content/legal.ts`, `components/legal/LegalDocument.tsx`, three routes). Footer legal links appear only when a document is non-null; the old "Participation waiver" label became "Participation Guidelines".

**Tests:** `tests/lib/permit-hold.test.ts`, `tests/components/PermitHold.test.tsx`, `tests/components/JoinForm.test.tsx`, `tests/e2e/{permit-hold,join,privacy-audit}.spec.ts`. Existing run-dependent specs now state the open state explicitly (props, a mock for the ics route test) or `test.skip(OFFICIAL_RUNS_ON_HOLD)`, so they run again automatically when the hold is lifted. `tests/social.test.tsx` no longer expects the scaffold's social links on `/join`.

## Decisions and assumptions (for Owner confirmation)

1. **Approved Join copy used verbatim**, including "Come to a run whenever it works for you." That line sits on a page whose runs are on hold; it does not claim permission, but the Owner may want a hold-aware variant.
2. **Section labels written here, not approved copy:** "The basics." and "Sign up." plus the five essentials rows and the form's disclosure paragraph. Please review wording.
3. **"Find a Run" labels and routes are unchanged**; they lead to the hold notice. Header, footer and hero keep their labels so lifting the hold changes nothing else.
4. **"Just show up" body copy changes while held** ("Find a hill, show up and climb it…") so it does not suggest organized runs exist. This edits an approved homepage line; it reverts with the flag.
5. **Footer newsletter block** ("Get the next run in your inbox." / "Join the list", disabled) still renders on every page, including `/join` and the hold notice, where it reads as a second, unavailable signup and mentions "the next run". It is shared chrome from PR #2, so it is **unchanged**. Recommend the Owner decide whether to hide it for v1 (J4).
6. **Checkbox is a native input** styled with CMR classes; no new design-system component was added.
7. **Membership is a manually kept roster.** No welcome email is sent; the confirmation says only that the signup was received.
8. **G2 profile amendment (both Formspree forms) is still the Owner's to make**; `.aiom/profile.md` was not edited.
9. Join does not display Instagram/Strava links (the scaffold's env-driven links were dropped; the footer still shows them when configured).

## Privacy and integration audit (2026-11-09, this build)

Evidence is code inspection plus `tests/e2e/privacy-audit.spec.ts`, which drives the built site in Chromium. **These are observations, not privacy claims.** Nothing here supports a retention period; none is stated.

| Area | Finding |
|---|---|
| Analytics | None in code or dependencies; the served HTML contains no analytics, tag-manager, pixel, chat or embed script and no iframe (test) |
| Cookies | None set while browsing nine pages (test); `document.cookie` empty |
| Local storage | Only `cmr-motion` ("on"/"off"), written **only** when the visitor uses the footer Pause/Resume control; empty otherwise; no sessionStorage or IndexedDB (test) |
| Third-party requests | Zero requests to other hosts while browsing (test). Fonts come through `next/font/google` and are self-hosted at build. OpenStreetMap appears as an attribution link only; maps are static local images |
| Third-party scripts | None loaded. `@formspree/react` bundles Stripe code but loads Stripe only if a Stripe key is passed to its provider; none is, and a submission made no Stripe request (test) |
| Formspree | The browser posts directly to `formspree.io/f/xrppvnln` (Join) or `/f/mwlljgld` (Questions). Join sends exactly `first_name`, `email`, `age_18_plus`, `_subject`, `_gotcha` (test). Formspree also receives what any request carries (IP, user agent). **Formspree's retention, notification recipient, allowed domains, spam settings and plan limits live in the Owner's account and could not be inspected** |
| Weather (NWS) | Server-side only, no visitor data sent; not rendered or fetched while the hold is on |
| Hosting / logging | No hosting config in the repo. **Vercel request logging, Vercel Analytics/Speed Insights toggles and log retention are dashboard settings I could not inspect.** Owner to verify before the Privacy Policy says anything about them |
| Newsletter footer form | Disabled; no provider configured (`NEXT_PUBLIC_NEWSLETTER_FORM_ACTION` unset). If an action is ever set it would post to that third party |
| Other personal data | None. No accounts, database, API route, or stored submissions in this app |

Privacy Policy text must be limited to what this table and the Owner's dashboard checks support.

## Validation (2026-11-09, macOS, Chromium)

Held (as shipped): `eslint`, `tsc --noEmit` (only the generated `PageProps`/`LayoutProps` types are absent outside `next build`), `tokens:check`, `next build`: pass. Vitest: 392 tests, 33 files, pass. Playwright (393 / 768 / 1440): 354 pass, 81 skipped (visual baselines, and open-state specs that do not apply while held), including axe with contrast on `/join` (idle, errors, success), `/calendar` hold notice, legal shells, hills and homepage.

**Reversibility check:** with `OFFICIAL_RUNS_ON_HOLD = false` (temporarily, then restored) the original Find a Run, homepage, hills and shared-UI specs pass: 369 Playwright, 390 Vitest. Lifting the hold is a one-line change.

Not done: `@visual` baselines for the new pages (macOS-only and excluded from CI); one real Formspree submission (needs explicit Owner authorization); contrast measurement on photographs (the new pages use no photograph).

## Future enhancements (documented, not built)

FAQ (needs content), legal text (needs approved drafts), newsletter provider, automated welcome email, any waiver workflow, organizer checklist, Strava/Instagram integration.

## Planning record (2026-11-08, preserved)

The sections below are the original planning evidence and recommendations. Where the Owner's 2026-11-09 direction differs (fields, copy, age confirmation, manual roster), the sections above govern.

## Owner-selected, not reopened

Signup integration: **Formspree**, endpoint `https://formspree.io/f/xrppvnln`,
form ID `xrppvnln`, through the existing `@formspree/react` 3.0.0 dependency
(already used by the Questions panel). No other form provider, database,
membership platform or authentication system. (Owner instruction, 2026-11-08.)

## Evidence

### Current `/join` (src/app/join/page.tsx)

A scaffold from the original project baseline, untouched by the foundation or
homepage work: `max-w-3xl` column, `<h1>Join Us</h1>`, one paragraph ("No
membership fees, no sign-up form, no app to download — just show up. Check the
calendar for the next run and follow along on Instagram and Strava."), and
Instagram/Strava links that render only when `NEXT_PUBLIC_INSTAGRAM_URL` /
`NEXT_PUBLIC_STRAVA_URL` are set (they are not, so no links show). No hero, no
`Container`, no form, no Formspree reference, no page-specific tests. The shared-ui
Playwright spec visits `/join` only for header/footer checks and axe.

### Join CTAs on the homepage and shell

Four CTAs read **"Join the club"** and go to `/join` (header, hero, Just show up,
footer link). The `/join` page heading still says **"Join Us"**. The footer also
shows the newsletter form on every page, including `/join`; its provider is not
chosen, so it renders **disabled** with "Newsletter signup isn't open yet." and its
button reads **"Join the list"**.

### Figma — Join Us page (`1:5`, file `hLEeAchFtgd1WFtboIChil`)

Desktop `1:5976` (1732×1942), Tablet `1:6108` (768×1731), Mobile `1:6235`
(393×1944). Each frame: shared navigation → full-bleed hero `1:6075` / `1:6204` /
`1:6331` ("JOIN US" mono eyebrow, "UP. DOWN. AGAIN." over a dusk hill photograph;
the mobile frame adds a topographic overlay) → one intro section `81:897` / `81:937`
/ `81:977` → shared footer. Intro section content:

| Block | Content | Desktop / tablet / mobile layout |
|---|---|---|
| Statement | "Joining is showing up." + "There's nothing to sign. Find a run on the schedule and come climb with us. Add your email below and we'll send the next run, hill workouts and the occasional dispatch from Chicago's highest points." + black **Find a Run** button | left column 624 / left 316 / stacked |
| "STAY IN THE LOOP" | mono eyebrow, MWDS email input + MWDS "Join the list" button (a newsletter-style email capture), caption: "Membership accounts, personal stats and attendance are coming to CMR — this is where they'll begin." | right column 624 / right 316 / stacked under the statement |

Other Figma pages hold only a "Join Us page" placeholder (Make import baseline) —
no other Join design exists. **The Figma Join page was drawn before the Formspree
decision and does not contain a signup form**: its only form is a newsletter-style
email field. It also shows the superseded header ("Shirts n' Stuff", "Join Us"),
and its caption promises accounts, stats and attendance, which are explicitly out
of v1. Hero photograph rights remain unconfirmed (as for the homepage).

### Governing decisions

- v1 scope (2026-08-20): "basic Join/community information"; out of v1: accounts,
  RSVP/attendance, member dashboard, paid membership.
- IA (2026-08-30, decision 2, Owner): `Join` stays the label; the page "must
  resolve the 'membership/application' expectation … by stating there is none for
  v1 — participation is find-a-run-and-show-up. No signup/account functionality is
  introduced." Join's primary action was "go to Calendar"; the design phase should
  treat it as a reassurance moment, and "just show up" as a reusable cross-page
  message.
- Profile: the one authorized external action is the third-party newsletter form
  plus social links; `data_sensitive: false` because "CMR's own systems never
  receive or store raw subscriber PII".

### Shared foundation available (from PR #2 and PR #3)

| Need | Reuse | Notes |
|---|---|---|
| Page width and gutters | `Container` | 1400 max, 24 / 48px gutters |
| Buttons | MWDS `Button` (`primary`, `secondary`; `default` / `lg` / `xl`) for form submit; `CtaLink` (`primary`, `secondary`, `outline`) for navigation | `CtaLink` is a link, not a submit control |
| Text input | MWDS `Input` (states, focus ring, `aria-invalid`) | |
| Form behavior | `QuestionsWidget`: `useForm`, `validateQuestion`, per-field and form error display, first-invalid focus, "Sending…" disabled state, success only after Formspree confirms, `_gotcha` honeypot, draft kept on error | The pattern to follow; its private `Field` and `textareaClass` should be extracted for sharing |
| Hero on photo | `PhotoBackdrop`, `HomeHero` pattern, `onDarkSurface` focus styles, `fluid.ts` (`FLUID_TYPE`, `fluidType`, `fluidVars`) | Any text on a photo needs the `contrast.mjs` measurement; the homepage still carries two accepted exceptions |
| Decorative | `TopoPattern`, `cmr-tie-dye` tints, mint (`bg-accent`) | Mint success state matches the Questions panel |
| Content status | `content-status.ts` / provisional markers | Applies if the page shows unconfirmed facts |
| Test patterns | `QuestionsWidget.test.tsx` (mocked `fetch`), `home.spec.ts` (Formspree routes aborted by default, mocked per test, CORS helper), axe helper, `contrast.mjs` | |

Gaps: there is no MWDS textarea, checkbox, radio or select in code or in the verified
Figma component set (only Button and Input are verified; the Questions textarea is an
ad hoc CMR class). Any field beyond text/email needs an Owner decision on whether to
add an MWDS component in Figma first (a Figma change is not authorized by this Work
Item).

## Recommendation (not a decision)

### What Join is, and what it isn't

| | Join the club | Newsletter | Run registration |
|---|---|---|---|
| Question it answers | "How do I become part of this?" | "How do I hear about runs?" | "Am I going on Tuesday?" |
| Where | `/join` (this Work Item) | Footer, every page | **Out of v1** (no RSVP/attendance); every run says "just show up" |
| Provider | Formspree `xrppvnln` | Not chosen; footer disabled | none |
| Commitment | Tells CMR who you are | Receive broadcasts | none |
| Questions panel | Separate: Formspree `mwlljgld`, asks a person a question | | |

Recommended framing: **joining is a light "count me in" and contact record, not an
application, an account or a registration**, and showing up never requires it. That
keeps IA decision 2 true in spirit (nothing to sign, nothing gates a run) while giving
the Owner's chosen form a real purpose. Whether the Owner sees it this way is Decision
J1.

### Proposed experience (for Owner direction; every line editable)

1. **One page, one job, one form.** Hero (Figma's, or simpler) → short statement →
   the form → a plain "what happens next" → "Find a run" as the secondary path.
   No modal, no steps, no account, no password.
2. **Minimum fields:** email (required), name (optional). Everything else is an
   Owner choice (J3); recommend collecting no health, emergency-contact, age or
   payment data in v1 (keeps `data_sensitive: false`, keeps the unwritten waiver
   separate from joining).
3. **States:** idle; inline validation (linked errors, first invalid field focused);
   sending (button disabled, "Sending…"); **success in place**, announced and focused,
   shown only after Formspree confirms; delivery failure keeps what was typed with a
   retry. All behavior follows the Questions panel so the site feels consistent.
4. **Honest confirmation.** The confirmation says only what the Owner can really do:
   Formspree notifies the Owner's inbox, it is not a mailing list, and automatic
   confirmation emails depend on the Formspree plan (verify in the account). If no
   email is sent, say so (J2).
5. **Copy keeps the club's voice** (matter-of-fact, witty, slightly sarcastic, joke
   not over-explained) — written by the Owner, not generated here.
6. **Keep "Find a Run" prominent.** Showing up is still the real way to join.
7. **Resolve naming.** Four CTAs say "Join the club", the page says "Join Us", and the
   disabled footer newsletter button directly below the form says "Join the list".
   Two different "join" actions on one screen will confuse people (J4/J5).
8. **Drop or reword Figma's accounts caption** — it promises features outside v1.

### Formspree integration (technical approach)

- `src/lib/join.ts`: `export const JOIN_FORM_ID = "xrppvnln"`, with the same comment
  style as `src/lib/questions.ts` (public identifier, not a credential, no recipient
  or token in the repo).
- `JoinForm` client component using `useForm<Fields>(JOIN_FORM_ID)`; pure
  `validateJoin()` exported and unit-tested; `noValidate` with our own linked
  messages; `_gotcha` honeypot; `maxLength` on every field; correct `autocomplete`
  (`email`, `name`). Optionally a hidden `_subject` so the Owner can tell Join mail
  from Questions mail (verify the field name against Formspree docs at build time).
- The page stays a Server Component; only the form is client code. No API route, no
  stored data, no new dependency, no environment secret.
- Step 1 of implementation extracts `Field` / textarea / email regex from
  `QuestionsWidget` into shared form pieces with **no behavior change**; the existing
  Questions tests are the regression guard.
- Formspree-side settings the Owner controls (not in the repo): allowed domains
  (production + Vercel previews), notification recipient, spam/reCAPTCHA (must stay
  off for AJAX), plan submission limits, retention, any auto-response.
- Tests never contact Formspree: unit tests mock `fetch`; Playwright aborts
  `formspree.io` by default and mocks responses per test. **A single real
  submission needs explicit Owner authorization.**

## Governance observations

- **G1: reconciling IA decision 2.** The Owner now selects a signup form where the
  2026-08-30 decision said no signup functionality and "no sign-up form" is in the
  scaffold. This is a material change to the page's purpose; it needs to be recorded
  as an Owner decision (J1), not inferred.
- **G2: external-action authorization.** `profile.md` authorizes exactly one
  external action (newsletter form, social links). The Questions form was added in
  homepage Round 2 by direction. The Join form is Owner-stated in this session
  (2026-11-08) but is not enumerated in the profile. Formspree will receive visitors'
  names and emails and retains submissions in its dashboard. CMR's own systems still
  store nothing, so `data_sensitive: false` plausibly holds, but its stated rationale
  is about the newsletter. **Recommend the Owner confirm a profile amendment
  enumerating both Formspree forms.** Not edited here; durable governance changes are
  the Owner's.
- **G3: privacy.** Collecting an email and name with no Privacy page (legal links are
  hidden because the pages are unauthored) is a launch gap. Recommend a short
  privacy line at the form and a Privacy page before launch (J7).

## Decisions needed from the Owner

Blocking implementation: J1, J2, J3, J5 (and G2 confirmation). The rest can follow
the first review.

| # | Decision | Recommendation |
|---|---|---|
| J1 | What does joining mean, and does the signup supersede "no signup, just show up"? | A light count-me-in and contact record; showing up never needs it. Record as superseding IA decision 2 in part |
| J2 | What happens after someone submits: who reads it, how fast, what (if anything) is sent back, are they added to the newsletter? | Say only what is true. Formspree is not a list; sending broadcasts needs the (unchosen) newsletter provider |
| J3 | Fields | Email required, name optional. Menu if wanted: neighborhood, running experience, how you heard, Instagram/Strava handle. Avoid health/emergency/age/payment data |
| J4 | Relationship to the newsletter, and the Figma "Stay in the loop" block | Keep them separate; point the Join page at the footer newsletter once it is enabled, or fold it in only if J2 says so. Resolve "Join the club" vs "Join the list" wording |
| J5 | Page copy and headline: keep "UP. DOWN. AGAIN." and "Joining is showing up.", or rewrite? Page heading "Join Us" vs "Join the club"? | Owner writes the copy. Remove the accounts/stats caption |
| J6 | Visual hierarchy: Figma (photo hero + two-column) vs a lighter page; hero photograph choice and rights | Reuse the homepage hero system if the hero stays; **do not place text on a low-contrast photo area again** — measure with `contrast.mjs` |
| J7 | Privacy and legal: privacy line at the form, Privacy page before launch; keep joining separate from the (unwritten) participation waiver | Yes to a privacy line; waiver stays its own decision |
| J8 | Formspree account: allowed domains, recipient, spam settings, plan limits, and authorization for one real test submission | Owner configures; test only with explicit authorization |
| J9 | Update Figma's Join Us page (stale header, no form) or build code-first? | Code-first from the decided copy; Owner updates Figma afterwards if wanted. No Figma edits by Claude without authorization |
| J10 | Instagram/Strava URLs (still unset): show as a secondary path on Join once supplied | Supply the two URLs before launch |

## Recommended implementation sequence (after Owner direction)

0. **Owner/GPT session:** decide J1–J5, write the copy deck and confirmation text;
   record them here as decisions. Confirm the G2 profile amendment.
1. Branch `feat/cmr-join-page` from `main`. Extract the shared form field pieces from
   `QuestionsWidget` (no behavior change; Questions tests unchanged and passing).
2. `src/lib/join.ts` (`JOIN_FORM_ID`, field limits) and `validateJoin` with unit tests.
3. `JoinForm` client component with component tests: validation, linked errors,
   focus, sending, success only on Formspree confirmation, field and form errors,
   honeypot, axe.
4. Replace the scaffold page: metadata, `Container`, hero/statement per the decided
   design, the form, "what happens next", Find a Run, optional social links. Server
   Component page; client form only.
5. Responsive and accessibility pass at 393 / 768 / 1440 and the 320–1920 sweep;
   keyboard order, focus on photo surfaces, reduced motion; measure any text on
   photography.
6. Playwright with Formspree mocked (default abort preserved); visual baselines for
   `/join`; update shared-ui `/join` checks.
7. Update this record with evidence; push, open a PR, CI and Vercel Preview **only
   when the Owner authorizes**; one real submission only with explicit
   authorization; production deployment is a separate authorization.

## Validation plan

`npm run lint`, `tsc --noEmit`, `npm run tokens:check`, `npm test`, `npm run build`,
`npm run test:e2e` (393 / 768 / 1440), `npm run test:visual`, axe (WCAG 2.2 AA) on
`/join` including error and success states, `contrast.mjs` for any text on a photo.
Deterministic checks are evidence, not Owner acceptance.

## Out of scope

Accounts, authentication, a database, a CMS, a membership platform, payments or
paid membership, RSVP/attendance, run registration, waiver signing, a newsletter
provider decision, email sending from CMR systems, Figma or MWDS library edits, any
production deployment.
