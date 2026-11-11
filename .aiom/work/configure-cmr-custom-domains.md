---
seed_version: '0.1'
id: configure-cmr-custom-domains
title: Configure the production custom domains (chicagomountainrunners.com, hillsonhills.com)
objective: >-
  Serve the CMR site at https://www.chicagomountainrunners.com (canonical), with
  chicagomountainrunners.com, hillsonhills.com and www.hillsonhills.com
  permanently redirecting to it, using the approach proven for whitaker.design
  and methods.club: Cloudflare DNS-only records to Vercel, Vercel-managed TLS
  and domain-level 308 redirects, one origin constant for canonical URLs,
  robots.txt and the sitemap.
status: complete
stage: implementation
active_capability: software-implementation
bundle_references:
  - software-engineering
  - external-action-integration
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-11-11T00:00:00.000Z'
updated_at: '2026-11-11T18:00:00.000Z'
---
## Status

**Complete: merged, deployed and verified in production (2026-11-11).** PR #27 merged as merge commit **`6bf77b1`** (head `bd21612`, merged with a head-commit guard, merge-commit method, one-time Owner-approved CI exception for the `browser` job; see below). The production deployment (`cmr-site-d9c7bvimb`, built from `6bf77b1`) is Ready and serves https://www.chicagomountainrunners.com; the legacy `cmr-site-xi.vercel.app` redirects to it.

## Authorization

Owner instruction of 2026-11-11 (this session): configure these four hostnames using the proven approach; stop and hand over the Cloudflare instructions before domain verification; complete the PR, review, merge, deployment and cleanup workflow while respecting required Owner approvals. No approval artifact was added; the instruction is recorded here. It does **not** extend to: changing nameservers, touching unrelated DNS records, adding Cloudflare Pages or Workers, changing `OFFICIAL_RUNS_ON_HOLD`, or accepting the risk below.

## Findings: the earlier setups

- **whitaker.design** (Next.js, Vercel, Cloudflare): DNS-only apex `A` records and a `www` `CNAME` at Vercel; mail records untouched; the `www` → apex 308 is a Vercel domain-level redirect (`redirect` + `redirectStatusCode: 308` on the project domain), not code. One site-URL module drives canonical URLs, Open Graph, `sitemap.ts` and `robots.ts`; indexing is gated by `SITE_INDEXABLE` + `VERCEL_ENV=production`. Verified from outside: HTTPS and certificate, 308s, canonical tags, sitemap URLs, a browser pass. Source: `whitaker-design-site/docs/deployment.md`, `docs/aiom/status.md` ("Launched").
- **methods.club** (Vite, Vercel, Cloudflare): the same DNS pattern; `www` → apex 308 at Vercel; one constant (`SITE.url`) feeds canonicals, sitemap and robots (generated, so they cannot disagree).
- Both currently use Vercel's project-specific records (`A 216.198.79.1 / 64.29.17.1`, `CNAME <hash>.vercel-dns-017.com`).

## What is reused, and what is not

| | Decision |
|---|---|
| Cloudflare DNS-only records to Vercel, no nameserver change, no Pages/Workers | Reused |
| Vercel domain-level 308 redirects (no application redirect code) | Reused; here the canonical host is `www`, and the apex plus both `hillsonhills.com` hosts redirect to it |
| One origin constant for metadata, robots, sitemap | Reused from methods.club (a constant, not an env var) |
| `SITE_INDEXABLE` gate | **Not reused.** CMR's production deployment is already public; indexing is already decided per page (`robots: { index: false }` for in-review legal documents, the disabled waiver). No new environment variable or Vercel setting is needed |
| Redirecting the `.vercel.app` address to the domain (whitaker.design does) | **Done after launch** (Owner-approved 2026-11-11, applied once the canonical domain was verified in production): `cmr-site-xi.vercel.app` 308 → canonical |
| Per-project DNS values | **Not copied.** CMR's `CNAME` target is `02928dbe640ba2eb.vercel-dns-017.com`, fetched from Vercel for this project |

## Done so far

Vercel (project `cmr-site`, `prj_4OOV3mOfRRyO0fpxJDgE64zrll56`; Owner's CLI session, no credentials handled): the four hostnames were attached on 2026-11-11 and are ownership-verified (no other project held them). `www.chicagomountainrunners.com` is the plain canonical host; `chicagomountainrunners.com`, `hillsonhills.com` and `www.hillsonhills.com` carry `redirect: www.chicagomountainrunners.com`, `redirectStatusCode: 308`. Before DNS, neither zone had any `A`, `AAAA`, `CNAME`, `MX` or `TXT` record.

Verified at Vercel's edge by Host header, before DNS (`curl -H "Host: <h>" http://216.198.79.1/hills/cricket-hill?utm_source=x&a=b%20c`): each of the three redirecting hosts answers one `308` straight to `https://www.chicagomountainrunners.com/hills/cricket-hill?utm_source=x&a=b%20c` (path and query preserved, no chain).

Code (branch `feat/cmr-custom-domains`): `src/lib/site.ts` (origin constant); `metadataBase` and `og:site_name/type/locale` in the root layout; a self-referencing canonical on every page; `src/app/robots.ts`; `src/app/sitemap.ts` with `src/lib/sitemap-paths.ts`; `docs/deployment.md`; `tests/lib/site.test.ts` and `tests/e2e/seo.spec.ts`.

## Cloudflare records for the Owner (both zones; DNS only, grey cloud)

`A @ 216.198.79.1`, `A @ 64.29.17.1`, `CNAME www 02928dbe640ba2eb.vercel-dns-017.com`.

## Risk the Owner must accept or resolve before merge (resolved: the Owner kept `OFFICIAL_RUNS_ON_HOLD = true`)

`implement-cmr-final-site-polish.md` (2026-11-09) lifted the permit hold because CMR was in private development and recorded that the Chicago Park District permit requirements, liability insurance and any formal authorization for recurring events "must be resolved before the domain is connected, members are invited or runs are advertised", and that the hold should be re-applied with the one flag (`OFFICIAL_RUNS_ON_HOLD = true`) if the Owner goes public before then. The current instruction connects the domain. This work item does not change the flag and does not decide that risk. **Owner to confirm one of:** (a) those items are resolved or accepted and the site goes public with runs shown; (b) set `OFFICIAL_RUNS_ON_HOLD = true` in this PR first. Related release dependencies recorded earlier: records marked `verified`, photograph rights (`public/home/README.md`), and the Formspree allowed-domains setting (add `www.chicagomountainrunners.com`; an Owner account setting, not changed here).

## Owner direction, 2026-11-11 (second instruction)

DNS records added; resume verification. Refine the Hills on Repeat gate before merge: while `OFFICIAL_RUNS_ON_HOLD = true`, `/calendar` keeps its hero and replaces the second section with a centred "Hills on pause." section ("Weekly hill repeat sessions will be posted shortly. Check back later or send us your questions."), the calendar and all scheduled-run content are not rendered (not CSS-hidden), the whole calendar implementation is preserved behind the flag, and "send us your questions" opens the existing Questions form as a centred modal dialog (shared form, translucent white backdrop, close/Escape/outside click, focus trap and restore, scroll lock). No legal, permit or insurance wording in the public message. Do not merge without explicit approval.

## Implemented in PR #27 (second commit)

- `src/components/calendar/HillsOnPause.tsx`; `/calendar` composes `FindHero held` + `HillsOnPause` when held, and the unchanged calendar (`FindHero`, `UpcomingList`, `RunCalendar`, `WeatherGuidance`, `FirstTimer`) when not. The old glass `PermitHold` notice component was removed (it had no other use); `PAUSE_COPY` in `src/lib/permit-hold.ts` holds the Owner's wording; the page description while held is the same sentence. The homepage, hill pages and Join keep their existing hold copy, unchanged.
- `QuestionsPanel` (shared form: fields, validation, Formspree `mwlljgld`, sending, success, errors) extracted from `QuestionsWidget`, which is now a shell around it with its behavior and markup unchanged; `QuestionsDialog` (native `<dialog>` + `showModal()`, explicit Tab wrap) is the second container.
- **`OFFICIAL_RUNS_ON_HOLD` set to `true` in this PR.** This is the launch-risk choice (b) above, inferred from the Owner's instruction to design the gate "while `OFFICIAL_RUNS_ON_HOLD = true`"; it was not stated outright. One line to reverse. It changes the homepage, hill pages and Join to their existing held wording as well as `/calendar`.
- Existing tests that encoded the lifted state (`final-refinements`, `visual-consistency`) are now flag-aware.

## Domain verification (2026-11-11, ~14:25-16:00 UTC)

- **DNS (authoritative `vern.ns.cloudflare.com`, plus 1.1.1.1 and 8.8.8.8):** `chicagomountainrunners.com` A 216.198.79.1 + 64.29.17.1 (Vercel); `hillsonhills.com` the same; `www.hillsonhills.com` CNAME `02928dbe640ba2eb.vercel-dns-017.com`. **`www.chicagomountainrunners.com` answers 104.21.26.33 + 172.67.135.85, which are Cloudflare edge addresses (CLOUDFLARENET): that record is proxied (orange cloud), not DNS only.** Nameservers unchanged.
- **Vercel:** all four attached, `verified: true`; `configuredBy` A / A / CNAME / `http` (the `www` host is reached over HTTP through Cloudflare). Certificates issued by Vercel (Let's Encrypt, to 2027-02-09) for all four hostnames; before that the proxied `www` returned Cloudflare 525.
- **HTTPS and redirects:** `https://{chicagomountainrunners.com, hillsonhills.com, www.hillsonhills.com}/hills/cricket-hill?utm_source=x&a=b%20c` each answer one `308` to `https://www.chicagomountainrunners.com/hills/cricket-hill?utm_source=x&a=b%20c` (path and query intact, HSTS set, valid certificate). Plain `http://` takes two hops (same-host HTTPS upgrade, then the 308), the same behavior as `www.whitaker.design`. No loops.
- **Canonical host `https://www.chicagomountainrunners.com`:** HTTP 200 on every route checked, served by Vercel through Cloudflare (`server: cloudflare`, `x-vercel-id` present, Cloudflare's wildcard certificate). It serves the **previous production build** (main `6bc23e9`), not PR #27: no canonicals, calendar visible, `/sitemap.xml` 404. `/robots.txt` returns **Cloudflare's managed content-signals file**, not the site's (Vercel's origin returns 404 for it): a side effect of the proxy.
- This Mac's system resolver negatively cached `www` for a while (curl "could not resolve" while `dig` against any server resolved), so `www` was checked with `--resolve` to its Cloudflare addresses. Local only.

## Owner approvals (2026-11-11, final instruction)

1. **Formspree:** the Owner checked the Chicago Mountain Runners project: "Restrict Submissions to Domain" is blank (unrestricted). No change needed for `mwlljgld` (Questions) or `xrppvnln` (Join).
2. **One-time CI exception for PR #27's `browser` job** (below).
3. `OFFICIAL_RUNS_ON_HOLD` stays `true`; "Hills on pause." with the calendar preserved behind the flag.
4. Cloudflare records correct, all four domains verified, `www.chicagomountainrunners.com` canonical.
5. After the canonical domain is verified in production, permanently redirect `cmr-site-xi.vercel.app` to it (paths and queries preserved, previews unaffected).
6. Merge PR #27 by the repository-supported method (merge commit) if the final review passes; do not bypass protections or proceed on a new substantive failure.

## CI exception: `browser` job, PR #27 (Owner-approved, one time)

**What failed.** The `browser` job failed on all six runs on this PR (heads `ccbd43d` twice, `8b8d910` three times, `23b31d9`, `be7af39`) in the step `npx playwright install --with-deps chromium`, which exits with code 100 after about 6.5 minutes, **before any Playwright test starts**. The runner could not resolve `azure.archive.ubuntu.com` or `security.ubuntu.com`, so apt could not fetch the browser's system fonts and libraries. npm, GitHub and Vercel traffic in the same job worked.

**Why it is environmental, not the code.**
- The last successful `main` run (`42946348690`, 02:30 UTC the same day) used the same `ubuntu-26.04` image and installed fine; the failures began after about 14:40 UTC with no workflow change. githubstatus.com listed no incident.
- A narrowly scoped pin of the `browser` job to `ubuntu-24.04` (`23b31d9`, within the Owner's authorization) failed identically, so it is not specific to the 26.04 image. The pin was reverted (`be7af39`); **the workflow has zero net difference from `main`** (`git diff origin/main -- .github` is empty). No other workflow change was made; `--with-deps` was kept.
- `validate` passed on every run (lint, tokens check, 497 unit tests, build). The branch ruleset "Protect default branch" requires only `validate` and the merge-commit method, so merging is within protections; no branch protection was modified and no check was disabled or weakened.

**Evidence that stands in for the missing CI run.** The complete Playwright suite (393 / 768 / 1440) passed locally on the application code being merged: 554 passed, 0 failed with `OFFICIAL_RUNS_ON_HOLD = true` (as committed), and 546 passed, 0 failed with it temporarily `false`; 497 / 495 unit tests; lint, tokens check and build clean. Everything under `src/` and `tests/` at the merge head `be7af39` is byte-identical to the commit those runs validated (`8b8d910`); the only later commits touch `.github/workflows/ci.yml` (pin, then revert, net zero). The Vercel preview built and was Ready, and an authenticated fetch showed the "Hills on pause" page with its canonical tag.

**Scope.** This exception covers PR #27 only. It is not a standing waiver; the `browser` job remains part of the project's gate and the next PR should run it normally.

## Resolved before merge

- **`www` proxied (orange cloud):** the Owner switched the record to DNS only. Verified: authoritative servers, 1.1.1.1, 8.8.8.8 and 9.9.9.9 return `02928dbe640ba2eb.vercel-dns-017.com`; Vercel serves a certificate issued for `www.chicagomountainrunners.com` (to 2027-02-09); Cloudflare's managed `robots.txt` is gone.
- **Formspree:** Owner confirmed "Restrict Submissions to Domain" is blank for the project; no change needed.
- **Launch risk:** Owner kept `OFFICIAL_RUNS_ON_HOLD = true` (approved 2026-11-11).

## Remaining (superseded; kept as the record of the plan)

1. Merge PR #27; verify the deployment. 2. Verify production. 3. Redirect `cmr-site-xi.vercel.app`. 4. Closeout PR. All done; see below.

## Production verification (2026-11-11, after the `6bf77b1` deployment was Ready)

- **Domains** (authoritative DNS, certificates, HTTPS and HTTP): `chicagomountainrunners.com`, `hillsonhills.com` and `www.hillsonhills.com` each answer one HTTPS `308` to `https://www.chicagomountainrunners.com/hills/cricket-hill?utm_source=x&a=b%20c` (path and query intact, valid Let's Encrypt certificates to 2027-02-09); plain `http://` takes two hops (same-host HTTPS upgrade, then the 308), as `www.whitaker.design` does; no loops. `www.chicagomountainrunners.com` serves 200 from Vercel directly.
- **Metadata:** canonical on every page is the `www` URL (root is the bare origin; queries excluded); `/robots.txt` is the site's own (`Allow: /` plus `Sitemap: https://www.chicagomountainrunners.com/sitemap.xml`); `/sitemap.xml` lists 15 canonical URLs, no run pages and no waiver; `/about/` redirects to `/about`; `/participant-waiver` is 404; `/calendar/<run>` redirects to `/calendar` and its `.ics` is 404.
- **Hills on Repeat:** `/calendar` shows the hero and the centred "Hills on pause." with the approved body and the questions link; no calendar, run, time, weather, permit or insurance content; the calendar implementation is preserved behind `OFFICIAL_RUNS_ON_HOLD` and returns when it is `false`.
- **Real-browser pass on production** (Chromium, 393 / 768 / 1440; 78 checks, 0 failures): ten pages return 200 with exactly one `h1` and no horizontal overflow; the Questions dialog opens centred with the question field focused, locks scrolling, and closes with Escape, the close button and a backdrop click with focus returning to the link; the floating "Questions?" panel opens and closes as before; header navigation intact; no console errors and no failed or 4xx/5xx requests.
- **Formspree** (Owner-requested, one real submission per form, clearly labelled tests with a non-real address, so two test messages are in the Owner's inbox): the Questions dialog and the Join form each showed their success state, and both POSTs returned 200 to `mwlljgld` and `xrppvnln`.
- **Legacy URL:** `cmr-site-xi.vercel.app` was set to a Vercel domain-level `308` to `www.chicagomountainrunners.com` (previously no redirect) only after the canonical domain was verified. `https://cmr-site-xi.vercel.app/hills/cricket-hill?utm_source=x&a=b%20c` redirects to the same path and query on the canonical host (one hop; HTTP two). Deployment and preview URLs are different hostnames and are unchanged (still redirect to Vercel sign-in, 302, before and after).

## Outcome

Delivered in PR #27: canonical origin constant, `metadataBase`, per-page canonicals, `robots.ts` and `sitemap.ts`; the Hills on Repeat "Hills on pause." gate with the calendar preserved behind the flag; the shared `QuestionsPanel` with the new `QuestionsDialog`; `docs/deployment.md`; unit, flag-state and Playwright tests. `OFFICIAL_RUNS_ON_HOLD` is `true`: the homepage, hill pages and Join show their existing held wording.

## Open items (not blocking; for later initiatives)

- The Park District permit requirements, liability insurance and formal event authorization recorded in `implement-cmr-final-site-polish.md` remain unresolved; the hold stays on until the Owner lifts it (one flag).
- The `browser` CI job should run normally on the next PR; if the runner's apt access is still failing, re-run it or open a separate, evidence-led CI change (the exception here covers PR #27 only).
- No social share image yet (link previews use title and description); the `.ics` event URLs use the request origin, which is now the canonical host.

## Closeout

Feature branch `feat/cmr-custom-domains` and its worktree are removed after this closeout merges; local `main` is fast-forwarded to `origin/main`.
