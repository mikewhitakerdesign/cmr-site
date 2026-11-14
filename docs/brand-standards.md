# Brand Standards

The CMR Brand Standards are a nine-chapter manual that lives on the website at
`/brand` and is also published as a PDF, with the logo files downloadable from
Marks › Files. All three are made from the same sources, so they cannot
disagree. This file is for the people who maintain it.

**Status: version 1.0, approved by the Owner (2026-11-14).** The manual has no
status tags: everything in it is the standard. Where a detail depends on a
material or a vendor (smallest sizes in print, print colors), it says so in
plain words and says how to settle it.

**Apparel is deferred.** `src/content/brand/apparel.tsx` (and `Tee.tsx`,
`demos/PlacementLab.tsx`) are kept for a later edition but are not in
`chapters` or `CHAPTER_SLUGS`, so the chapter has no route and no PDF pages.
To publish it, add it back to both lists, give it a number, and rebuild the PDF.

## What is where

| Path | What it is |
|---|---|
| `src/content/brand/*.tsx` | The chapters (Apparel kept but unpublished). Each is one `BrandChapter`: a slug, a title, and plates (one plate is one section on the web and one page in the PDF). `index.ts` is the reading order. |
| `src/lib/brand/manual.ts` | Version, chapter and plate types, the "how to read it" notes, page arithmetic for the PDF, public paths. |
| `src/lib/brand/spec.ts` | Specifications that are **not** design tokens: measurements of the approved artwork, and mirrors of component values. |
| `src/lib/brand/palette.ts`, `tokens.ts` | The palette. Values are read from the site's stylesheets at build time. No color is typed into a chapter. |
| `src/lib/brand/color.ts`, `voice.ts` | Pure functions: WCAG contrast, HSL, CMYK arithmetic; the headline checks. |
| `src/components/brand/` | Page kit (`kit.tsx`), sticky row (`BrandNav.tsx`), chapter openers, PDF-only pages (`print.tsx`), demos (`demos/`). |
| `src/app/brand/` | Routes: `(manual)/page.tsx` (landing), `(manual)/[chapter]/page.tsx`, `print/page.tsx` (the PDF's source, noindex). |
| `src/styles/brand.css` | Loaded by the brand routes only. Scroll offsets, the PDF page size, mask-edge trimming. |
| `scripts/brand/build-pdf.mjs` | Prints `/brand/print` to the PDF and validates it. |
| `public/brand/logos/` | The logo files: `cmr-badge-black.svg` and `cmr-wordmark-black.svg` are the **vector masters**; the white SVGs, the 3000 px PNGs and `cmr-logos.zip` are derived. |
| `scripts/assets/trace-badge.mjs` | Traces the approved badge raster into the badge master (one-off; needs potrace). |
| `scripts/assets/outline-wordmark.mjs` | Outlines the wordmark master from Geist Black (one-off; needs fontkit and wawoff2). |
| `scripts/assets/build-sparse-contours.mjs` | Traces a still frame of the animated contour field into `public/home/topo-sparse.svg` and `src/components/brand/sparse-contours.ts` (drawn by `SparseContours`): the sparse contours of the PDF cover and the Graphic language examples. The site's own fallbacks and the PDF chapter openers keep the denser `public/home/topo.svg`. |
| `scripts/brand/build-logo-assets.mjs` | `npm run brand:logos` (`:check`): derives every other logo file and the site icons (`src/app/icon.svg`, `favicon.ico`, `apple-icon.png`) from the two masters. Deterministic. |
| `public/downloads/cmr-brand-standards.pdf` | The PDF the Download button serves. A static file. |

Shared files outside `/brand`: `src/components/SectionNav.tsx` gained optional
`leading` and `trailing` slots (the chapter menu and Download PDF; without them
its markup is unchanged). Review 01 also changed, by Owner direction: the
footer (Brand Standards is the last link of the secondary row,
`src/lib/navigation.tsx`); the homepage hero gradient (25%,
`HomeHero.tsx`, `PhotoBackdrop.tsx`); the inverted hover of the filled CTA
buttons (a 1 px inset outline, `CtaLink.tsx`); the "Just show up" shade and
copy (38%, full white, which brings the copy to WCAG AA, `JustShowUp.tsx`); and
the site icons (`src/app`). The sitemap lists the manual's pages
(`src/lib/sitemap-paths.ts`).

## One source, two layouts

A chapter is data plus a `render()` function. The website wraps each plate in
`WebPlate` (full-width section, sticky-bar anchor). The PDF wraps the same plate
in `PrintPlate` (one fixed 1320 × 1020 px page). Print-only adjustments use the
`[.brand-print_&]:` Tailwind variant inside the shared components, so nothing is
written twice. Interactive demos are marked `WEB_ONLY`, and the PDF shows a
static equivalent.

To change a standard, edit the chapter. To change a *value* (a color, a type
size), change its source, not the chapter.

## Where values come from

| Value | Source of truth | How the manual gets it |
|---|---|---|
| Primary colors (black, white, neutrals) and the working colors (accent, borders) | Figma MWDS, CMR theme, exported to `tokens/mwds` and compiled to `src/styles/generated/mwds-tokens.css` | `tokens.ts` parses that file and follows the `var()` chain |
| Secondary colors (the six wash and dye families), contour grays, quiet ink | `src/styles/cmr.css` | Same parser; `color-mix` is evaluated |
| Display type roles | `src/lib/headings.ts` | Mirrored in `spec.ts`; a test compares them with `fluidType` |
| Mesh gradient control colors | `scripts/assets/bake-mesh-gradient.mjs` | Mirrored in `spec.ts`; a test parses the script and compares all 16 |
| Badge, wordmark, silhouette geometry | The vector masters in `public/brand/logos` and the approved artwork | Measured once, recorded in `spec.ts` |
| Contrast ratios, HSL | Computed | `color.ts` |

The manual prints no CMYK, Pantone or thread values: color for print is matched
by proofing (Owner decision, Review 01).

`tests/lib/brand.test.ts` checks every mirror against its source, so a change to
a token or to `headings.ts` fails a test until the manual is updated.

## Building the PDF

The PDF is generated at build time by Chromium (Playwright, already a dev
dependency). Nothing generates PDFs at runtime.

```bash
npm run build
npm run start -- -p 4320 &
npm run brand:pdf -- --base http://localhost:4320     # writes public/downloads/…
npm run brand:pdf:check -- --base http://localhost:4320   # validate only, write nothing
```

Rebuild it whenever a chapter, the version, or any value the manual prints
changes, and commit the result. `tests/lib/brand.test.ts` fails if the committed
PDF's page count differs from what the chapters declare, which catches a stale
file.

The script refuses to write a PDF if any of these fail:

- the print route does not render the page count it declares;
- a page is not exactly 1320 × 1020 px, or its folio is wrong;
- content reaches past its page's content box;
- any element spills out of its own container (this is what catches overlap);
- an image failed to load or decode.
- a visible link would become a PDF link to the build server (addresses are printed as text).

It then reads the written PDF's own page tree and compares the count. It does
not loosen those checks to pass; fix the layout instead.

Format: US Letter landscape (11 × 8.5 in), printed at 80%, so 16 px body type is
about 9.6 pt. Text is real and selectable; headings become bookmarks; the file
is tagged; the title is in its metadata.

**Known characteristics.** Geist is embedded as Type 3 glyphs (Chromium's
output for variable fonts); text selects and searches normally. Color is RGB, so
this is a screen and office-print document, not a press file.

### Version bump

`MANUAL.version` in `src/lib/brand/manual.ts` sets the cover, colophon, landing
page, PDF filename and PDF title. Raise it with every Owner-approved change.

## Photography and rights

The homepage hero is the Owner's and cleared. The About ("path") photograph is
cleared for its current use on About (Owner, Review 01); it shows recognizable
people, so the manual does **not** reproduce it, and any other use is asked for
first. The "Just show up" (tree-line) photograph has no rights record yet: it
stays where it is on the website and is not to be reused elsewhere.

## Future MWDS integration map

MWDS is a separate project, not started here. This is what is expected to
move, so the manual's layouts and graphics do not have to be rebuilt.

| Area | Today | Likely change | Parity risk |
|---|---|---|---|
| Core color, spacing, radii, shadows | MWDS tokens exported from Figma into `tokens/mwds` | Consumed from the MWDS package | Low |
| `--cmr-*` variables in `cmr.css` | CMR-only | Promoted into the CMR theme in Figma, then aliased | Low if hex values carry over exactly |
| Display type roles | Five fluid roles in `headings.ts`, off the MWDS scale | MWDS text styles with per-breakpoint values | **Medium**: line height and tracking must match to the pixel, or the manual's type specimens (and the TypeTester) drift |
| Buttons | `CtaLink` for marketing surfaces, MWDS `Button` for forms | One component with on-photo variants | **Medium**: hover inversion and the focus-ring gap are CMR-specific; the Digital chapter's button and focus demos would change |
| Geist metrics | `next/font` self-hosted Geist | Same family, possibly a different version | **Medium**: a different Geist release can move line breaks, and the PDF's fixed pages are validated for overflow |
| Tie-dye, contours, hill profiles | CMR artwork and code | Stay CMR | None |
| This manual | Reads through `src/lib/brand` | Repoint `SOURCES` in `tokens.ts` and the variable names in `palette.ts` | Low |

What to change at that point: `tokens.ts` (two file reads), `palette.ts` (variable
names), `spec.ts` (the mirrored values), and re-run `tests/lib/brand.test.ts` and
the PDF validation. Chapters should not need editing.

## Future editable Figma manual

The manual must eventually be a native, editable Figma Design file. It has not
been started, and screenshots of this site are not a substitute.

Proposed approach, for a later authorized task:

1. **Wait for MWDS and the CMR theme**, so the file is built on real variables,
   text styles and components, not copies.
2. **One Figma page per chapter, one frame per plate**, at the PDF's 1320 × 1020
   size. This repository already gives the exact hierarchy: chapter slug, plate
   id, number and title (`src/content/brand/*.tsx`).
3. **Build the repeating blocks as components**: plate header, spec table, spec
   list, rule, usage example (do and don't).
   These mirror `src/components/brand/kit.tsx` one to one.
4. **Take content from the chapters**, not from screenshots: every spec table is
   structured data in the chapter files and can be exported as JSON.
5. **Place artwork from the masters**: the badge and wordmark from
   `public/brand/logos`, the contour SVG and the hill profile SVGs. Demos become static frames; the interactive
   states are documented as component variants.
6. **Reconcile with the website** by diffing the Figma export against the chapter
   data before each new edition.

## Known limitations of this edition

- The badge master is a trace of the approved 1386 px raster (no original
  vector exists). It reproduces it faithfully (0.18% of inked pixels differ, all
  on the edge; checked by `tests/lib/brand.test.ts`) but inherits the raster's
  edge texture, visible only on close inspection at very large sizes (a
  multi-foot banner). For that, proof first, or commission an approved redraw.
- The site header and footer still draw the marks from the earlier raster
  masks and trace (`CmrLogo`, `CmrWordmark`); the masters match them to within
  a pixel. Switching them over is optional and was not part of Review 01.
- The hill silhouette is a raster (373 × 1540 px). No social sharing image exists.
- The favicon at 16 px is a small horizontal shape (the badge is 2.29 : 1).
- No print, embroidery or thread colors and no physical minimum sizes: these
  come from vendor proofs.
- The homepage hero headline is below WCAG AA (1.4 to 1.9:1 against 3:1), an
  Owner-accepted exception; the options are in Photography › Type on photos.
- The PDF uses fixed-size pages validated at one Geist version; see the MWDS
  table above. Some pages keep white space above bottom-anchored content.
