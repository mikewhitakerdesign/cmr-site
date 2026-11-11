# Deployment

Vercel, Git-integrated, team `mikewhitaker-projects`, project `cmr-site`
(framework preset Next.js, no `vercel.json`). Every push to a branch gets a
preview deployment; merging to `main` deploys production. The default Vercel
address is https://cmr-site-xi.vercel.app.

## Domains

| Hostname | Behavior |
|---|---|
| `www.chicagomountainrunners.com` | **Canonical production site** |
| `chicagomountainrunners.com` | 308 → `https://www.chicagomountainrunners.com` |
| `hillsonhills.com` | 308 → `https://www.chicagomountainrunners.com` |
| `www.hillsonhills.com` | 308 → `https://www.chicagomountainrunners.com` |
| `cmr-site-xi.vercel.app` | Serves the site (no redirect); its pages name the canonical host |

All four hostnames are attached to the `cmr-site` Vercel project. The three
redirects are **Vercel domain-level redirects** (project → Settings → Domains,
or the API's `redirect` and `redirectStatusCode: 308` on a project domain), the
same mechanism `whitaker.design` and `methods.club` use for `www`. Vercel
preserves the path and the query string. Nothing in the application handles the
non-canonical hosts, so there is no redirect code to maintain. An HTTPS request
to a secondary host takes one hop, straight to `https://www.chicagomountainrunners.com`.
A plain `http://` request takes two: Vercel first upgrades the same host to
HTTPS, then redirects it (the same as `www.whitaker.design`).

## DNS (Cloudflare)

Cloudflare is the DNS provider for both zones (its nameservers stay as they
are). Records are **DNS only (grey cloud), never proxied**, so Vercel terminates
TLS and issues the certificates. Both zones carry the same three records:

| Type | Name | Content |
|---|---|---|
| A | `@` | `216.198.79.1` |
| A | `@` | `64.29.17.1` |
| CNAME | `www` | `02928dbe640ba2eb.vercel-dns-017.com` |

These are the values Vercel returns for the project
(`GET /v6/domains/<hostname>/config?projectIdOrName=cmr-site`,
`recommendedIPv4` rank 1 and `recommendedCNAME` rank 1). The CNAME target is
project-specific; it is not the one `whitaker-design-site` or `methods-club`
use. The generic fallbacks `76.76.21.21` and `cname.vercel-dns.com` also work.
Neither zone had any other record (no mail) when these were added.

No Cloudflare Pages, Workers, redirect rules or proxying are used. **Keep every record
DNS only.** A proxied (orange cloud) record puts Cloudflare in front of Vercel: it
answers with its own certificate, and Cloudflare's managed `robots.txt` (AI
content-signal comments) is served in place of, or in front of, the site's own.
Check `dig +short A www.chicagomountainrunners.com`: it should return Vercel
addresses (`216.198.79.65`, `64.29.17.65`), not Cloudflare's (`104.21.x`, `172.67.x`).

## Canonical URLs, metadata and sitemap

- **One constant.** `SITE_ORIGIN` in `src/lib/site.ts`
  (`https://www.chicagomountainrunners.com`) feeds `metadataBase`, every
  canonical URL, `robots.txt` and `sitemap.xml`, so they cannot disagree. There
  is no environment variable: previews and the `.vercel.app` address also name
  the production host. To move domains, change the constant and redeploy.
- **Canonicals.** Every page declares a self-referencing
  `alternates.canonical` (relative; `metadataBase` makes it absolute). The home
  page's canonical is the bare origin. Query strings are never part of it.
  `tests/lib/site.test.ts` fails if a page has none.
- **`robots.txt`** (`src/app/robots.ts`): `User-Agent: *`, `Allow: /`, and the
  absolute sitemap URL. Pages that must not be indexed say so themselves with a
  robots meta (`index: false`).
- **`sitemap.xml`** (`src/app/sitemap.ts`, paths from `src/lib/sitemap-paths.ts`):
  home, About, Calendar, run pages (only while official runs are not on hold),
  Hills and each hill page, The Science, Join, FAQ, and each legal document that
  is published. It never lists the participant waiver (404 and `noindex`), the
  `.ics` downloads or a legal document that is still `null` (in review).
- **Open Graph.** `og:site_name`, `og:type` and `og:locale` are set. There is no
  social share image yet, so link previews fall back to the title and
  description.

## Official runs on hold

`OFFICIAL_RUNS_ON_HOLD` in `src/lib/permit-hold.ts` is the single switch for scheduled-run
content. While it is `true`, `/calendar` shows the hero and a centred "Hills on pause."
section, whose "send us your questions" link opens the Questions form in a modal dialog,
and the calendar, run pages, `.ics` downloads and run references elsewhere are not
rendered. Set it to `false` to restore the full calendar exactly as built. The sitemap
follows the flag (no run pages while held).

## Releasing a change

Merge a reviewed PR to `main`. Vercel builds it and assigns the production
domains automatically. Check https://www.chicagomountainrunners.com afterwards.

## Rollback

A bad release: Vercel → Project → Deployments → a previous production
deployment → **Instant Rollback**.

Reverting the domains: remove the four hostnames from the project (Settings →
Domains, or `DELETE /v9/projects/cmr-site/domains/<hostname>`) and delete the
six Cloudflare records. The site keeps serving at `cmr-site-xi.vercel.app`.
