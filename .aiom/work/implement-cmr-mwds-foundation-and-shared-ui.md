---
seed_version: '0.1'
id: implement-cmr-mwds-foundation-and-shared-ui
title: Implement the MWDS token foundation and CMR shared UI (navigation, footer, newsletter signup)
objective: >-
  Establish a production-quality MWDS-to-code foundation (Figma variables →
  version-controlled DTCG tokens → Style Dictionary → CSS custom properties →
  Tailwind CSS v4) and implement the first reusable CMR components (site
  navigation, footer, newsletter signup) from the approved CMR Figma designs,
  with tests and visual validation.
status: active
stage: implementation
active_capability: ui-implementation
bundle_references:
  - repository-versioned-delivery
  - software-engineering
  - web-ui-experience
authority_requirement: none
validation_state: passed
blocker_state: none
current_responsibility: owner
created_at: '2026-11-07T05:40:00.000Z'
updated_at: '2026-11-07T08:05:00.000Z'
---
## Objective

Turn the approved CMR Figma designs and the MWDS library into a reviewable
code foundation: one token system that Figma owns, generated styling, and the
shared navigation, footer, and newsletter components, without redesigning
approved layouts.

## Inputs

- CMR website: Figma `hLEeAchFtgd1WFtboIChil` (Home/Desktop 1:10, Tablet
  1:451, Mobile 1:884; Navigation 1:436 / 78:259 / 78:377; Footer 1:314 /
  78:359 / 78:477).
- MWDS library: Figma `H08HgMeVx6V23wY7aZdENf` (11 variable collections; the
  `cmr` modes on `semantic colors` and `brand colors`; Button and Input
  component sets).
- Owner brief (2026-11-07): MWDS is the shared UI foundation; CMR brand and
  semantic modes are published; primary buttons are black, secondary buttons
  warm cream, mint an accent; all 20 newsletter forms use linked MWDS
  instances; preserve CMR compositions; Phase 1 has no auth and no database.
- Prior state: `define-cmr-v1-ia-and-content-model` (complete) and
  `scaffold-cmr-v1-nextjs` (complete). `mwd-x-shadcn` commits `60d0b15`
  and `3b92f7a` established the public/internal naming contract reused here.

## Owner decisions (2026-11-07)

1. **Apparel nav item omitted.** Figma's "Apparel" (desktop) / "Shirts n'
   Stuff" (tablet, mobile) item is left out: merch is out of v1 scope and has
   no route. Nav is data-driven (`src/lib/navigation.tsx`), so adding it back
   is a one-line change once scoped. Figma labels are used on the existing v1
   routes: Find a Run → `/calendar`, Chicago ~~Hills~~ Mtns → `/hills`,
   About → `/about`, Join Us → `/join`. This resolves the IA's deferred
   Calendar-label decision with Figma's "Find a Run". Routes are not renamed.
2. **Legal links hidden until pages exist.** The footer takes legal links as
   data and renders only those with an `href`. Privacy, Terms, and
   Participation waiver have none yet. The risk notice and copyright ship as
   designed. No legal pages were authored.
3. **Newsletter: native form posting directly to the provider.** This
   clarifies the 2026-08-20 "third-party embedded form" decision. The MWDS
   input and button submit with `method="post"` to the provider's hosted
   endpoint (`NEXT_PUBLIC_NEWSLETTER_FORM_ACTION`, https only), so the browser
   sends the address to the provider and no CMR server code receives or
   stores it. The privacy property behind `data_sensitive: false` is
   unchanged. With no endpoint configured, the form renders disabled with a
   status note and never posts to a placeholder. Choosing and connecting a
   provider is still a separate, Owner-authorized external action.
4. **Tooling: Vitest + Playwright now; Storybook deferred.** See the Storybook
   evaluation below.

## Token architecture (implemented)

See `tokens/README.md` for the full description.

- **Source:** `tokens/mwds/<collection>/<mode>.tokens.json` in DTCG format,
  exported from Figma by `scripts/tokens/figma-export.js` (Plugin API,
  read-only) and written by `scripts/tokens/import-export.mjs`. The import
  verifies each file against the FNV-1a checksum Figma computed. Aliases stay
  aliases. Figma scopes, descriptions, and publishing flags are kept under
  `$extensions.com.figma`.
- **Provenance:** `tokens/mwds/manifest.json` records the source file, export
  time, exporter version, every collection's key and all source modes, the
  exported modes, alias-closure selection, exclusions with reasons, and a
  checksum per file.
- **Modes:** the `cmr` theme is an explicit pairing,
  `semantic colors=cmr` + `brand colors=cmr`, verified on the CMR file's
  NewsletterForm (1:324), which sets both. Pairing only one would resolve
  accent and border through the default MWDS brand mode (blue).
- **Resolution validated against Figma, not against itself:**
  `scripts/tokens/figma-resolve-oracle.js` asked Figma's resolver for 44
  colors on a real CMR node (`tokens/mwds/validation/cmr.resolved.json`). All
  44 resolve identically through the generated CSS.
- **Build:** Style Dictionary 5 (`scripts/tokens/build.mjs`) emits
  `src/styles/generated/mwds-tokens.css`. That file holds internal `--mwd-*`
  properties that keep the Figma alias chain as `var()` indirection, followed
  by the public shadcn-style API defined in `tokens/mapping.mjs`. It also
  emits `mwds-tailwind-theme.css`, a Tailwind v4 `@theme inline` bridge that
  re-exports values and defines none of its own. This mirrors the
  `mwd-x-shadcn` contract.
- **Single token system:** Tailwind's default color palette is removed
  (`src/styles/theme-reset.css`). Existing placeholder pages were migrated
  mechanically (`text-zinc-*` → `text-muted-foreground`, `divide-black/10` →
  `divide-border`). Dark-mode CSS was removed because MWDS has no `cmr-dark`
  mode.

## Components (implemented)

| Component | Props | Notes |
|---|---|---|
| `ui/button.tsx` | `variant` (`primary`, `secondary`), `size` (`default`, `lg`, `xl`), `asChild`, native button props | Only MWDS-verified variants and sizes. States map to the MWDS bindings: hover `unofficial/*hover`, focus 3px `focus/ring`, disabled 50% opacity. |
| `ui/input.tsx` | native input props | MWDS Input (Large). Error state via `aria-invalid` or `:user-invalid` (no JS). Focus uses `border 4` + ring. |
| `CmrLogo.tsx` | `className` | Unmodified Figma assets. The luminance mask with intersect composite reproduces Figma's mask group; the Figma reference code's CSS defaults would render a solid rectangle. |
| `Header.tsx` (+ `NavLink.tsx`) | `items`, `cta`, `className` | Server Component with a client island for `aria-current`. Three breakpoints match Figma geometry exactly (asserted in tests). |
| `Footer.tsx` | `newsletter` (props, or `false`), `links`, `legal`, `riskNotice`, `year`, `className` | Sits on the `accent` surface (cmr/mint/100). |
| `NewsletterSignup.tsx` | `heading`, `description`, `headingLevel`, `action`, `emailFieldName`, `hiddenFields`, `target`, `placeholder`, `submitLabel`, `unavailableMessage` | Provider-agnostic: Mailchimp (`EMAIL` plus hidden list fields), Kit, and Buttondown all fit. |

Accessibility: a skip link, labelled `Primary` and `Footer` nav landmarks,
`aria-current`, a visually hidden email label, `autocomplete="email"`, a
`role="status"` note when signup is unavailable, a visible 3px focus ring on
every interactive element, and the struck-through jokes kept in accessible
names.

## Validation evidence (2026-11-07)

Deterministic checks. Passing them is not Owner acceptance.

- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.
- `npm run tokens:check`: pass (committed CSS equals a fresh build).
- `npm test` (Vitest): 95/95 pass. Token integrity, 44 Figma-oracle
  resolutions, the alias chain, the public contract, and the 4px spacing grid;
  component props, states, and axe (contrast is excluded in jsdom).
- Mutation check: a hand-edited token, stale CSS, and a wrong mode pairing
  were each caught (2, 6, and 2 failing tests respectively), then reverted.
- `npm run build`: pass (all v1 routes prerender).
- `npm run test:e2e` (Chromium 393/768/1440): 25 pass, 2 skipped (desktop-only
  assertion on narrower viewports). Header, logo, CTA, and link positions
  match Figma to the pixel; computed colors are the CMR token values; keyboard
  focus shows a 3px black ring; axe reports no WCAG 2.2 AA violations,
  including color contrast. The desktop layout test was confirmed to fail on a
  real regression found during visual review, which was then fixed.
- Visual review: header and footer screenshots at three widths compared with
  the Figma frames. macOS baselines are committed for `npm run test:visual`.

## Design-to-code discrepancy log

Each is resolved in code as stated; items marked **Figma** need a design-side
fix or decision.

1. **Figma: the desktop footer hides the newsletter form.** Frame 1:373 is
   fixed at 130px while its grid content is 322px, so the next section paints
   over the form. Code follows the grid intent (form visible, 32px row gap).
2. **Figma: inconsistent nav label.** "Apparel" on desktop, "Shirts n' Stuff"
   on tablet and mobile. The item is omitted (decision 1).
3. **Figma: "Join the list" resized to 131px**, narrower than its label plus
   MWDS Extra Large padding (152px), so the label overruns its padding. Code
   uses the MWDS `lg` padding token with a 131px minimum width, which looks
   identical and still grows for longer labels.
4. **Newsletter control heights** are 44px on desktop and 48px on tablet and
   mobile. These are instance overrides; MWDS Input Large is 40px and Button
   XL is 48px. Code reproduces each breakpoint.
5. **Figma: values not bound to variables.** Footer fill `#ddffea` (equals
   `cmr/mint/100`, so code uses `accent`); nav and footer text black (code
   uses `foreground`); the Join Us CTA's 2px border and 6px radius (code uses
   `foreground` and `rounded-md`); Geist Black 900 headings with `ss08` (MWDS
   heading weight is Semibold); mobile nav text at 13px and footer headings at
   28/32 (mobile) and 30/32 (tablet), all off the MWDS scale (MWDS h2 is
   30/30). The off-scale values are reproduced and commented in code.
   Recommend binding or adding these in Figma.
6. **Figma: the Join Us CTA is not an MWDS instance.** Its 2px black outline
   doesn't match MWDS Outline (1px `border 3` plus shadow). It is implemented
   as a token-styled link, not an MWDS Button variant. Decide whether MWDS
   needs a strong-outline variant or the CTA should become MWDS Secondary.
7. **Interaction states are not drawn in the CMR file** (link hover, current
   page, CTA hover, focus). They are implemented with MWDS semantics:
   underline, `ghost-hover`, and a 3px `focus/ring`. Needs design review.
8. **MWDS focus ring on primary buttons.** In CMR, `focus/ring` is black with
   no offset, so on the black primary button the ring reads as a slightly
   larger button. It passes axe; recommend a design review (for example a
   2px offset).
9. **Breakpoint inconsistencies reproduced as designed:** 80% link opacity on
   desktop only; footer top border on desktop only; the tablet nav row sits 8px
   inside the logo's bounding box; the footer link row omits Hills.
10. **Omitted as having no visible effect:** the desktop header's 8px backdrop
    blur and white bottom border on an opaque white background.
11. **MWDS library hygiene:** `focus/ring error` has empty scopes, so it can't
    be picked in Figma; `shadows/sm/shadow 2/x2` is named inconsistently
    (others are `x`); in `cmr` mode, `unofficial/outline` resolves to filled
    grey `#ececec`. The exporter and build handle all three.
12. **Oracle coverage:** a consuming file exposes only the library variables
    it imports, so the Figma oracle covers 27 of 54 semantic colors, including
    every one the components use. The remaining 27 are checked only through
    the checksummed source.

## Storybook evaluation

Deferred, not rejected. For three components, Vitest covers props, states,
and axe, and Playwright covers real rendering, geometry, focus, contrast, and
visual baselines. Storybook (`@storybook/nextjs-vite`) would add a large
devDependency tree, a second build, and CI time, mainly to show isolated
state catalogs. Revisit when any of these holds: around 8 or more shared
components; designers reviewing states outside the app; or a need for hosted
visual review (Chromatic). Stories could then reuse the test fixtures.

## Proposed improvements (evidence-based; Owner decision needed)

- **Commit the two untracked Work Items.**
  `define-cmr-v1-ia-and-content-model.md` (status complete) and
  `explore-cmr-v1-visual-direction.md` (status active) are untracked in git,
  so durable state exists only in one working copy. The visual-direction item
  also still lists application code as out of scope, while the approved Figma
  designs show its exploration has concluded. Recommend the Owner record its
  outcome and close it. This Work Item did not modify either file.
- **Upstream the pipeline to `mwd-x-shadcn`.** The Plugin API exporter (modes,
  aliases, scopes), the checksum import, and the Figma resolution oracle are
  product-agnostic and supersede that repo's Make-CSS retrieval, which covers
  the default mode only. CMR would then consume a published package instead of
  carrying the pipeline. This is a separate Work Item in that repository.
- **Code Connect.** The Owner approved this as the next governed increment
  (2026-11-07). It is captured in `.aiom/work/implement-mwds-code-connect.md`
  (status proposed, awaiting Owner review of architecture and Figma
  relationships) and is deliberately not part of this Work Item.

## Flagged for Owner review before merge (2026-11-07)

1. The desktop footer's Figma clipping (discrepancy 1).
2. The custom Join Us CTA versus the existing MWDS variants (discrepancy 6).
3. Navigation hover, current-page, and keyboard-focus states, which were
   designed in code rather than in Figma (discrepancy 7).
4. Focus-indicator visibility on black primary buttons (discrepancy 8).
5. Visual snapshots are macOS-only: CI runs only the platform-independent
   browser checks (geometry, computed colors, focus, axe), so visual
   regressions are caught only when `npm run test:visual` runs on a Mac.

## Dependency audit (2026-11-07; not auto-fixed)

`npm audit` on this branch: 18 advisories (2 low, 11 moderate, 4 high,
1 critical). `main` has 14 (8 moderate, 5 high, 1 critical). No `npm audit
fix` was applied.

- **Introduced by this branch (dev and build-time only):** `deepmerge` and
  `@bundled-es-modules/deepmerge` (low), and `glob` and
  `@bundled-es-modules/glob` (moderate), all through `style-dictionary`.
  Style Dictionary runs only on the checked-in token files, never on
  untrusted input or in the shipped site. The only offered fix is
  `--force` to style-dictionary 3.9.2, a major downgrade that would break the
  pipeline; track upstream instead.
- **Pre-existing on `main`, development tooling:** typescript-eslint,
  `minimatch`, and `brace-expansion` (through eslint-config-next; the `--force`
  fix would downgrade it to 15.x), `js-yaml`, and `zod` (through
  eslint-plugin-react-hooks).
- **Pre-existing on `main`, RUNTIME, critical:** `next@16.3.1` (range
  16.0.0–16.4.0). It includes unauthenticated RCE and SSRF advisories in the
  Image Optimization API, `next/og`, and `use cache`, fixed in 16.4.5
  (non-major). `sharp@0.35.3` (high, libheif and librsvg) ships with `next`.
  This branch adds the site's first `next/image` use (the logo); the
  optimization endpoint exists either way. Recommend a separate,
  Owner-authorized Next.js upgrade to ≥ 16.4.5 before any deployment.
- **Resolved on this branch as a side effect:** `source-map-js`.

## Out of scope (unchanged)

Newsletter provider selection or connection; real social handles; legal page
content; implementing page bodies to Figma; Apparel or merch; accounts and
databases; deployment; changes to `mwd-x-shadcn` or to the Figma files (all
Figma access in this item was read-only).

## Authority requirement

None. All work is local, reversible, in-repo implementation within the
approved v1 scope and the Owner's 2026-11-07 brief and decisions. Merge to
`main`, deployment, and connecting a newsletter provider each require
separate Owner authorization.
