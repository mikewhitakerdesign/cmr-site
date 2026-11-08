# Chicago Mountain Runners

The website for Chicago Mountain Runners. Next.js (App Router, TypeScript,
Tailwind CSS v4), deployed to Vercel. UI is built on MWDS (MWD x Shadcn DS)
tokens exported from Figma.

This project is governed by MWD AIOM. See [`AGENTS.md`](./AGENTS.md) before
making scope, architecture, or external-action decisions.

## Development

Requires Node 24 (see `.nvmrc`; ≥ 22.12 works).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
|---|---|
| `npm run lint` | ESLint |
| `npm test` | Vitest: token contract (vs. Figma), components, axe |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright at 393/768/1440 against a production build (run `build` first): shared UI and homepage |
| `npm run test:visual` | Screenshot comparison (macOS baselines) |
| `npm run tokens:build` | Regenerate CSS from `tokens/mwds` (Style Dictionary) |
| `npm run tokens:check` | Fail if generated CSS is stale (runs in CI) |
| `npm run tokens:import` | Write a Figma token export into `tokens/mwds` (checksum-verified) |

## Design tokens

Figma is the source of truth. Don't edit `tokens/mwds/` or
`src/styles/generated/` by hand. See [`tokens/README.md`](./tokens/README.md)
for the pipeline, mode handling, and how to re-export. Use semantic utilities
(`bg-primary`, `text-muted-foreground`, `rounded-lg`, `text-p-sm`). Tailwind's
default color palette is intentionally unavailable.

## v1 scope

Home, About, Running Calendar (upcoming runs + run detail pages), Hills
(overview + individual hill profiles), Join, Instagram/Strava links, and
newsletter signup. See [`.aiom/profile.md`](./.aiom/profile.md) for the full
recorded decision and what's explicitly out of v1.

## Content status

Nothing on the site is verified CMR content yet. Every run, hill, and club
total carries a `status` (`src/lib/content-status.ts`):

| Status | Meaning | On the homepage |
|---|---|---|
| `placeholder` | Scaffold filler ("Example Hill") | Never shown |
| `provisional` | From the approved Figma design, not confirmed | Shown with a visible "Sample · unconfirmed" / "unverified" marker |
| `verified` | Confirmed by the Owner | Shown as designed, no marker |

Before launch, set every shown record to `verified` (or remove it), replace the
club totals in `src/lib/club-totals.ts` (or set the export to `null` to hide the
section), and resolve the asset items in [`public/home/README.md`](./public/home/README.md).

## Run schedules

Runs live in `src/lib/runs.ts`; the scheduling logic is in
`src/lib/schedule.ts` (pure functions, America/Chicago, DST-aware). Each run has
one schedule:

```ts
// Every Tuesday at 5:30 AM, with exceptions
schedule: {
  kind: "weekly", weekday: "TUE", time: "05:30",
  startsOn: "2026-11-03",                                  // optional
  endsOn: "2027-03-30",                                    // optional
  cancellations: [{ date: "2026-11-24", note: "Thanksgiving week" }],
  overrides: [{ date: "2026-12-01", time: "06:00", meetupLocation: "Montrose Harbor lot" }],
}

// A single dated run; `special: true` for a one-off special run
schedule: { kind: "once", date: "2026-12-05", time: "07:00", special: true }
```

A run moved to another day is a cancellation plus a `once` run. The homepage
shows the next three occurrences in Chicago time and is regenerated hourly
(`export const revalidate = 3600` in `src/app/page.tsx`); no client polling.

## Homepage

Built from the CMR Figma homepage (Desktop `1:10`, Tablet `1:451`, Mobile
`1:884`). Section components are in `src/components/home/`; shared CMR
compositions (`Container`, `CtaLink`, `ArrowLink`, `PhotoBackdrop`,
`ProvisionalBadge`, `icons`) are in `src/components/`. Layout values that
differ per Figma frame interpolate between 393, 768 and 1400px
(`src/lib/fluid.ts`). Design decisions and deviations are recorded in
[`.aiom/work/implement-cmr-homepage.md`](./.aiom/work/implement-cmr-homepage.md).

## Social links

Instagram and Strava links are hidden everywhere until real destinations are
configured; there are no placeholder defaults.

| Variable | Accepted value |
|---|---|
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://www.instagram.com/<handle>` (https, on instagram.com, with an account path) |
| `NEXT_PUBLIC_STRAVA_URL` | `https://www.strava.com/clubs/<club>` (https, on strava.com, with a path) |

Values are read at build time. Anything that doesn't qualify is ignored and the
link stays hidden.

## Newsletter signup

The signup form posts directly to the newsletter provider's hosted endpoint;
no CMR server code receives the address. Until it is configured, the form
renders disabled with a "not open yet" note.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_NEWSLETTER_FORM_ACTION` | Provider form endpoint (must be `https://`) |
| `NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD` | Provider's email field name (default `email`; Mailchimp `EMAIL`, Kit `email_address`) |

Choosing and connecting a provider is a separate, Owner-authorized step.
