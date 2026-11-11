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
validation_state: not-started
blocker_state: awaiting-owner-review
current_responsibility: owner
created_at: '2026-11-11T00:00:00.000Z'
updated_at: '2026-11-11T00:00:00.000Z'
---
## Status

**Active, waiting on the Owner.** The Vercel side and the code are done; the Owner adds the Cloudflare DNS records, then post-DNS verification runs, then the Owner approves the merge. Not merged, not live on the custom domains.

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

## Remaining

1. Owner adds the Cloudflare records. 2. Verify DNS, certificates, HTTPS, redirects (all four hosts, path and query), canonical, robots, sitemap and key routes on the live hosts. 3. Owner decision on the risk above. 4. PR checks green, Owner merge approval, merge, production deployment verified. 5. Close this Work Item; remove the branch and worktree.
