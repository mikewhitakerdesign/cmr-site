---
seed_version: '0.1'
id: scaffold-cmr-v1-nextjs
title: Scaffold the CMR v1 Next.js application
objective: >-
  Stand up the Next.js (App Router, TypeScript) v1 site skeleton on the
  decided page scope, as local, reversible, in-repo work — no deployment,
  domain, or third-party account creation.
status: complete
stage: implementation
active_capability: software-implementation
bundle_references:
  - repository-versioned-delivery
  - software-engineering
  - web-ui-experience
  - content-publication
authority_requirement: none
validation_state: passed
blocker_state: none
current_responsibility: orchestrator
created_at: '2026-08-21T04:20:00.000Z'
updated_at: '2026-08-21T04:45:00.000Z'
---
## Objective

Scaffold the v1 Next.js app skeleton per the Owner-decided scope recorded in
`.aiom/profile.md#v1-scope-decision-2026-08-20`: Home, About, Running
Calendar/upcoming runs + run detail pages, Chicago hills overview +
individual hill profiles (elevation/repeat info), basic Join/community info,
Instagram/Strava outbound links, and a third-party embedded newsletter
signup form placeholder.

## Context

This is local, reversible, in-repo scaffolding — package.json,
App Router structure, placeholder pages/content, base styling. It does not
include: connecting a real newsletter provider account, deploying to
Vercel, registering a domain, or any other action that crosses the
project's boundary. Those remain separately Owner-authorized when reached
(per `external-action-execution`'s Owner-authorized-by-default rule).

## Notes

Scaffolded with `create-next-app` (App Router, TypeScript, Tailwind CSS)
into a scratch directory and merged into the repo (existing `.aiom/`,
`AGENTS.md`, `CLAUDE.md`, `.git` preserved untouched). No code was committed
— it sits as untracked working tree changes pending Owner review.

Pages implemented: `/`, `/about`, `/calendar` (+ `/calendar/[slug]`),
`/hills` (+ `/hills/[slug]`), `/join`. Footer carries Instagram/Strava
outbound links and the newsletter signup component.

Hill/run content (`src/lib/hills.ts`, `src/lib/runs.ts`) and social links
(`src/lib/social.ts`) are explicitly labeled placeholders — no real CMR
facts (hill names, schedule, handles) were invented or asserted.

Newsletter signup (`src/components/NewsletterSignup.tsx`) reads
`NEXT_PUBLIC_NEWSLETTER_EMBED_URL`; with it unset it renders a "coming
soon" placeholder rather than a fabricated or broken embed. No third-party
account was created and no real external call is made yet — connecting a
real provider is a separate, later Owner-authorized step under
`external-action-execution`.

`npm run build` and `npm run lint` both pass; all v1 routes returned HTTP
200 against a local dev server (removed after the check — nothing left
running).

Follow-on: real content authoring (hills, runs, copy), choosing/connecting
an actual newsletter provider, and Vercel deployment are separate,
Owner-authorized steps not taken here.
