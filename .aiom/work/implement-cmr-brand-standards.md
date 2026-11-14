---
seed_version: '0.1'
id: implement-cmr-brand-standards
title: CMR Brand Standards: interactive manual at /brand and a PDF edition
objective: >-
  Build the complete Chicago Mountain Runners Brand Standards as an interactive
  section of the website (landing page and ten chapters, with a sticky row that
  carries the chapter menu, the page's sections and a Download PDF action) and as
  a PDF generated at build time from the same content, for Owner visual review.
  Not a merge or a deployment.
status: active
stage: validation
active_capability: ui-implementation
bundle_references:
  - web-ui-experience
  - content-publication
  - software-engineering
authority_requirement: owner-authorization-satisfied
validation_state: passed
blocker_state: owner-visual-review
current_responsibility: owner
created_at: '2026-11-13T00:00:00.000Z'
updated_at: '2026-11-14T00:00:00.000Z'
review_round: review-01
---
## Status

**Version 1.0 release candidate, ready for final Owner review (2026-11-14).**
Branch `feat/brand-standards`: the original build (`0175cd5`) plus the Review 01
refinement commit. Local only: not merged, not deployed, no pull request.
Merge and release require the Owner's explicit authorization after review.

## Authorization

Owner direction, 2026-11-13: the Phase 1 to 3 assessment, then authorization to
implement the complete interactive Brand Standards and PDF to a local
visual-review milestone, on a feature branch, with local commits permitted. Not
authorized: merge, deploy, production changes, changes to global identity assets
or shared tokens, MWDS integration, or creating the Figma deliverable.

Clarifications, 2026-11-13 (recorded here, applied in the manual):

- **Logo hierarchy:** badge primary, stacked wordmark secondary, hill silhouette
  supporting. Provisional, subject to visual review.
- **Badge vector:** a faithful reconstruction is authorized as a *proposed*
  master. The production asset is not replaced.
- **Trademark:** existing ™ appearances preserved; no registration or legal claim.
- **Terminology:** "club" (everyday), "running community" (descriptive), "group
  runs" (organized activity).
- **Expressions:** Hills on Repeat, Hills on Hills and Get High in the City are
  CMR expressions, not separate brands; no ™ added.
- **Color:** mint a core accent, cream an available secondary, pastels and mesh
  gradient an expressive palette; the final hierarchy remains subject to review.
- **Merchandise:** conceptual guidance only, clearly distinguished from approved
  production artwork; no invented vendor specifications.
- **Photography:** hero photograph rights confirmed by the Owner; other
  photographs and the consent of identifiable people unverified, flagged, and
  not reproduced where unconfirmed.
- **Tooling:** the integrated website architecture with shared-content PDF
  generation. The standalone `brand/` publication architecture is superseded.
- **Science Figure 3:** Owner-directed, AI-assisted original artwork.

## What was built (original build, 0175cd5)

See `docs/brand-standards.md` for the file map, the PDF process, the token
architecture, the MWDS integration map and the Figma production notes.

- `/brand` and ten chapters: Premise, Marks, Color, Typography, Graphic language,
  Photography, Voice, Digital, Apparel, Governance. Each plate carries one of four
  evidence tags (Established, Inferred, Proposed, Unresolved).
- One sticky row (the shared `SectionNav`, extended with optional leading and
  trailing slots): chapter menu, this page's sections, Download PDF.
- Interactive demonstrations: swatch copy, contrast checker, logo stage with
  clear space, type tester, contour lab, gradient lab, headline checker,
  placement diagram.
- A PDF of 81 pages: `public/downloads/cmr-brand-standards.pdf`.
- A footer link and sitemap entries. The print route is noindex and unlisted.
- A proposed vector badge in `public/brand/proposed/` (not used in production).

## Files changed outside the new brand directories

`src/components/SectionNav.tsx` (optional slots; default markup unchanged),
`src/lib/navigation.tsx` (one footer link), `src/lib/sitemap-paths.ts`,
`package.json` (two scripts), and the existing footer, sitemap and canonical
tests updated for the new link and routes.

## Open items for the Owner

Final review of the release candidate, then (separately) authorization to merge
and release. Still open, none blocking: physical minimum sizes and print colors
(from vendor proofs); print artwork for tie-dye and the gradient; a vector of
the hill silhouette; rights for the tree-line photograph; the homepage
headline's contrast (accepted exception, options recorded); a social image.

## Review 01 (Owner creative review, 2026-11-14)

Authorization: the Owner's Review 01 brief (implement the agreed refinements,
validate, prepare 1.0 for final review; no merge, deploy or PR). The session
was interrupted once (editor crash) after the content work and before the PDF
build; recovered from the working tree with nothing lost.

Owner decisions applied: badge primary, wordmark full name, no lockup yet; the
vector badge promoted to production master after validation; favicon from the
badge outline only; primary colors pure #000000 / #FFFFFF with the neutral scale
unchanged; six wash and dye families are the Secondary palette, mint ramp and
cream removed from the palette (the interface accent stays as a working color);
gradient examples 25% and 50%, homepage hero now 25%; 96 px provisional screen
minimum (the smallest header width in use); no invented print colors; path
photograph cleared for its current use; Apparel deferred (hidden, kept);
governance simplified; free participation distinguished from optional paid items.

Built and changed:

- Manual: status tags reduced to Provisional and Pending (untagged = standard);
  every SOURCE line, repository path and Figma node id removed; version 1.0,
  "Release candidate"; landing hero without buttons and shorter; nine chapters.
- Premise (animated contour frame, static in the PDF; new Purpose; simplified
  Today and later; The Core Brand; no Never column), Marks (two marks; grounds
  on photograph and tie-dye; Files with eight downloads and a ZIP; site icon),
  Color (Primary, Secondary, print guidance by proofing), Typography (web values
  labeled as web values), Graphic language (silhouette moved in; contour,
  profile and composition guidance; Person icon and Figure 3 callout removed),
  Photography (broader subjects, crops, rights), Voice (warrior starter
  replaced, softer rules, examples), Digital (button outline), Governance (five
  plates: who decides, assets, using the brand, keeping current, decided/open).
- Assets: `public/brand/logos/` (badge and wordmark, black and white, SVG master
  and 3000 px transparent PNG, ZIP with README); `src/app/icon.svg`,
  `favicon.ico` (16/32/48), `apple-icon.png`. Badge master = the reviewed trace
  (path byte-identical), cropped to the badge; wordmark master outlined from
  Geist Black to the Figma type specification (1 px fringe vs the Owner's art).
  `npm run brand:logos[:check]` derives everything from the two masters.
- Site (Owner-directed): footer secondary row ends with Brand Standards;
  homepage hero gradient 25%; filled CTA hover/press keeps a 1 px inset outline;
  "Just show up" shade 30% → 38% and copy 90% → 100% white.

Contrast re-evaluation (tests/e2e/contrast.mjs, worst region, macOS Chromium,
12 widths 320–1920): hero headline 1.40–1.88:1 at 25% (1.37–1.72:1 at 20%),
needs 3:1, remains the Owner-accepted exception; a black headline would reach
6.97–9.03:1 (a visible design change, left for the Owner). "Just show up" copy
3.47–4.19:1 before; full-white copy alone 3.96–4.35; 35% shade 4.47 at 1920;
38% shade + full white 4.82–5.71:1 (heading 4.46–5.11:1), applied as the
smallest change that passes at every width; now asserted in tests/e2e/home.spec.ts.

Defects found and fixed in validation: the premise frame drew white (the
token-inverting frame flipped the contour field's black); the PDF carried eight
links to the build server (download pills; now labels in print, and
`build-pdf.mjs` refuses to write any such link); Governance scrolled sideways
at 393 (a long address in a grid column); stale homepage HTML from an old
local server's ISR cache (local only, cleared).

## Validation (Review 01, 2026-11-14)

- `tsc --noEmit`, `eslint`, `npm run tokens:check`, `npm run brand:logos:check`: clean.
- Unit and component tests: 577 passed (43 files), including the logo files
  (vector, no raster, 7 badge subpaths, master vs approved raster < 0.5% of
  inked pixels, PNG size and transparency, ZIP contents byte-for-byte, icon has
  one shape) and no implementation commentary in any chapter.
- Production build clean. Playwright, entire suite at 393, 768 and 1440: 715
  passed, 173 skipped by design, 0 failed (brand, homepage incl. photo-text
  contrast, footer, SEO, Join, hills, Science, shared UI).
- PDF: 72 pages, US Letter landscape, 11.7 MB, built by `build-pdf.mjs` with all
  checks passing; no external links; smallest essential text 6.6 pt (diagram
  labels 6.0 pt). Every page inspected visually from 110 dpi renders.
- Visual review of every chapter at 1440 and the landing, grounds, files,
  footer, button states and tablet layout; no console errors or failed
  requests on any brand route.

## Validation of the original build (2026-11-14, superseded by Review 01)

- `tsc --noEmit`, `eslint` and `npm run tokens:check`: clean.
- Unit and component tests: 572 passed (43 files), including `tests/lib/brand.test.ts`
  (colors read from the stylesheets and compared with Figma's oracle, type roles and
  gradient colors mirrored from their sources, badge and wordmark artwork compared with
  the approved files, committed PDF page count equals the chapters') and
  `tests/components/brand`.
- Production build: clean; all 12 brand routes prerendered static.
- Playwright, entire suite at 393, 768 and 1440: 719 passed, 169 skipped by design,
  0 failed. This includes the existing Science, FAQ, Join, homepage, hills and SEO
  specs, so those pages are unchanged. `tests/e2e/brand.spec.ts` covers: direct load of
  every route, the sticky row (position under the header, anchors, current section,
  chapter menu, keyboard), Download PDF as a real file, the print route being noindex
  and unlisted, every interactive demo, no sideways scroll and no axe violations
  (including contrast) on all 11 pages.
- PDF: 81 pages, US Letter landscape (792 × 612 pt), 12.1 MB, tagged, language `en`,
  titled, 209 bookmarks, selectable text on every page, folios 01 to 81 verified,
  photographs embedded at 190 to 380 dpi. `build-pdf.mjs` fails (and writes nothing) on
  any page-size, overflow, spill, image or page-count error.
- Visual review of every PDF page, and of the site at three widths
  (`docs/review/brand-standards/`).

Defects found by that validation and fixed: sideways scroll on phones (grid tracks sized
to a table's minimum width); a stray space in the Download PDF accessible name; a hairline
box around masked marks in the PDF (the manual now draws the wordmark as inline vector and
the badge as a transparent image of the approved mask); a chapter-menu panel opening
off-screen on phones; invisible white buttons in a black demo frame.

## Known limitations

See docs/brand-standards.md, "Known limitations of this edition" (current as of
Review 01). Superseded items from the original build: the proposed badge vector
(now the master), the missing favicon (made), the RGB-only CMYK arithmetic (no
longer printed).
