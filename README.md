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
| `npm run test:e2e` | Playwright at 393/768/1440 against a production build (run `build` first) |
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

Hill and run data in `src/lib/hills.ts` and `src/lib/runs.ts` are
placeholders, as are the social links in `src/lib/social.ts`. Replace them
with real CMR content before launch.

## Newsletter signup

The signup form posts directly to the newsletter provider's hosted endpoint;
no CMR server code receives the address. Until it is configured, the form
renders disabled with a "not open yet" note.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_NEWSLETTER_FORM_ACTION` | Provider form endpoint (must be `https://`) |
| `NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD` | Provider's email field name (default `email`; Mailchimp `EMAIL`, Kit `email_address`) |

Choosing and connecting a provider is a separate, Owner-authorized step.
