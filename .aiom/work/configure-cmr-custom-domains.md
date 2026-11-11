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
status: active
stage: implementation
active_capability: software-implementation
bundle_references:
  - software-engineering
  - external-action-integration
authority_requirement: owner-authorization-required
validation_state: in-progress
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-11T00:00:00.000Z'
updated_at: '2026-11-11T16:00:00.000Z'
---
## Status

**Active, waiting on the Owner's merge approval.** The Owner added the Cloudflare records (2026-11-11) and approved resuming verification; the Hills on Repeat gate and Questions dialog were added to this PR on the Owner's direction. PR #27 is not merged: the custom domains currently serve the previous production build (no canonicals, calendar visible, no sitemap).

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
| Redirecting the `.vercel.app` address to the domain (whitaker.design does) | **Not done** (not requested); canonical tags point at the production host. Open option for the Owner |
| Per-project DNS values | **Not copied.** CMR's `CNAME` target is `02928dbe640ba2eb.vercel-dns-017.com`, fetched from Vercel for this project |

## Done so far

Vercel (project `cmr-site`, `prj_4OOV3mOfRRyO0fpxJDgE64zrll56`; Owner's CLI session, no credentials handled): the four hostnames were attached on 2026-11-11 and are ownership-verified (no other project held them). `www.chicagomountainrunners.com` is the plain canonical host; `chicagomountainrunners.com`, `hillsonhills.com` and `www.hillsonhills.com` carry `redirect: www.chicagomountainrunners.com`, `redirectStatusCode: 308`. Before DNS, neither zone had any `A`, `AAAA`, `CNAME`, `MX` or `TXT` record.

Verified at Vercel's edge by Host header, before DNS (`curl -H "Host: <h>" http://216.198.79.1/hills/cricket-hill?utm_source=x&a=b%20c`): each of the three redirecting hosts answers one `308` straight to `https://www.chicagomountainrunners.com/hills/cricket-hill?utm_source=x&a=b%20c` (path and query preserved, no chain).

Code (branch `feat/cmr-custom-domains`): `src/lib/site.ts` (origin constant); `metadataBase` and `og:site_name/type/locale` in the root layout; a self-referencing canonical on every page; `src/app/robots.ts`; `src/app/sitemap.ts` with `src/lib/sitemap-paths.ts`; `docs/deployment.md`; `tests/lib/site.test.ts` and `tests/e2e/seo.spec.ts`.

## Cloudflare records for the Owner (both zones; DNS only, grey cloud)

`A @ 216.198.79.1`, `A @ 64.29.17.1`, `CNAME www 02928dbe640ba2eb.vercel-dns-017.com`.

## Risk the Owner must accept or resolve before merge

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

## Remaining

1. **Owner: set `www` (CNAME) in Cloudflare to DNS only** (grey cloud) in the `chicagomountainrunners.com` zone, then recheck that it resolves to Vercel addresses and Vercel reports it correctly. 2. Owner confirms the launch-risk choice (the flag is `true` in this PR) and the Formspree allowed domain. 3. PR #27 CI and Vercel preview green; Owner explicit merge approval. 4. Merge, then verify production on all four hosts (canonicals, robots.txt that is the site's own, sitemap, `/calendar` pause page, Questions dialog). 5. Close this Work Item; remove the branch and worktree.
