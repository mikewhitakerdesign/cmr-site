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
---
## Status

**Ready for Owner visual review, local only (2026-11-14).** Branch
`feat/brand-standards`, based on `2331eb8`. Not merged, not deployed, no pull
request. Merge requires the Owner's approval after visual review.

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

## What was built

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

Listed in the manual itself (Governance, "Open decisions") and in the review
report. In short: confirm the logo hierarchy and the proposed badge vector; the
favicon and social image; the final color hierarchy; minimum sizes; print colors;
rights for two photographs; the ™ position; the first merchandise item; who may
use the marks.

## Validation (2026-11-14, final build)

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

- The PDF is RGB and uses fixed pages validated against one Geist version; the pipeline
  page and a few others leave white space above bottom-anchored content.
- Geist is embedded as Type 3 glyphs (text selects and searches normally); "≈" falls back
  to the system font, in 15 places.
- Mesh gradient is a 256 px baked image stretched to size (smooth by nature).
- The committed PDF is 12 MB and will grow the repository with each regenerated edition.
- Unverified by me: how the PDF looks in every viewer (checked via PyMuPDF and Chromium
  only), and Windows/Linux font rendering.
