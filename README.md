# Chicago Mountain Runners

The website for Chicago Mountain Runners. Next.js (App Router, TypeScript,
Tailwind CSS), deployed to Vercel.

This project is governed by MWD AIOM — see [`AGENTS.md`](./AGENTS.md) before
making scope, architecture, or external-action decisions.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## v1 scope

Home, About, Running Calendar (upcoming runs + run detail pages), Hills
(overview + individual hill profiles), Join, Instagram/Strava links, and a
third-party embedded newsletter signup. See
[`.aiom/profile.md`](./.aiom/profile.md) for the full recorded decision and
what's explicitly out of v1.

Hill and run data in `src/lib/hills.ts` and `src/lib/runs.ts` are
placeholders — replace with real CMR content before launch. Newsletter
signup needs a real provider embed URL via `NEXT_PUBLIC_NEWSLETTER_EMBED_URL`.
