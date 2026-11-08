# CMR homepage — review evidence

Captured 2026-11-08 after **Round 2** and **Round 2.1** (Owner/GPT-approved visual refinements)
from the production build (`npm run build && next start`) on branch
`feat/cmr-homepage`, Chromium, 1× device pixel ratio, after scrolling the page
so lazy images and the one-time figure animation have run. Figma references are
read-only renders of the CMR file (`hLEeAchFtgd1WFtboIChil`): Home / Desktop
`1:10` (1732 wide), Tablet `1:451`, Mobile `1:884`.

| File | What it shows |
|---|---|
| `build-393.jpg`, `build-768.jpg`, `build-1440.jpg`, `build-1732.jpg` | Full page at the Figma frame widths (1440 = the desktop 1400 container state; 1732 = the Figma frame width, downscaled to 1440) |
| `build-1024.jpg`, `build-1280.jpg` | Full page at intermediate widths |
| `figma-vs-build-393.jpg`, `-768.jpg`, `-1732.jpg` | Three panels: **Figma** · **build** · 50% overlay. Round 2 intentionally departs from Figma in several sections (below), so the overlays document the differences rather than claim fidelity |
| `round-2/before-*.jpg` / `round-2/after-*.jpg` | Full page before Round 2 (PR #3 at `b1b26e5`) and after, at 393 / 768 / 1440 |
| `round-2/header-expanded-1440.jpg`, `header-compact-1440.jpg` | Sticky header at the top and after scrolling (compact, 1px black rule) |
| `round-2/totals-rolling-1440.jpg`, `totals-settled-1440.jpg` | Club totals mid-roll (≈ 0.4s after entering view) and settled |
| `round-2/hills-default-1440.jpg`, `hills-hover-horner-1440.jpg` | Hills section with Mt. Trashmore (default) and while hovering Horner Hill |
| `round-2/hill-profiles-family.jpg` | All five hill profiles with their annotations |
| `round-2/topo-static-1440.jpg` | The topography at rest (Round 2; the liquid cursor effect it once accompanied was removed in Round 2.1) |
| `round-2-1/before-hero-*.jpg` / `after-hero-*.jpg` | **Round 2.1.** The hero (header to the Next run card) at 393 / 768 / 1440 before and after the original photograph |
| `round-2-1/buttons-rest-hover.jpg` | Every CTA at rest and on hover: header outline, hero pair, Just show up pair (black → white, white → black, outline → black; 1px borders) |
| `round-2-1/before-hill-profiles-family.jpg`, `hill-profiles-family.jpg` | The five hill profiles before and after the refinement |
| `round-2-1/before-hills-default-1440.jpg`, `hills-default-1440.jpg`, `hills-hover-horner-1440.jpg` | The Hills section before and after, and the hover preview |
| `round-2-1/topo-static-1440.jpg`, `topo-pointer-moving-1440.jpg`, `before-topo-liquid-1440.jpg` | The static topography at rest and with the pointer moving across it (identical), and the removed liquid effect |
| `round-2-2/before-*` / `after-hero-*.jpg`, `buttons-rest-hover.jpg`, `hill-profiles-family.jpg`, `hills-default-1440.jpg`, `footer-1440.jpg` | **Final refinement.** All Join CTAs read "Join the club"; filled buttons have no border, rest or hover (the header outline keeps its 1px); hill profiles in black and white only; the footer link |
| `round-2/questions-open-1440.jpg`, `questions-open-393.jpg`, `questions-validation.jpg` | Questions panel open (desktop, mobile) and with validation errors |

`build-*.jpg` and `figma-vs-build-*.jpg` show the current page (Round 2.1). Other
`round-2/` and `round-2-1/` captures are historic: the hero labels, button borders and Hills images there predate the final refinement.

Interaction captures hide the sticky header where Playwright would otherwise
stitch it into an element screenshot.

How to read the overlays:

- **Round 2 changes (Owner direction, 2026-11-08), not drift**: sticky header
  with links on the right and "Join the club"; solid black / white CTAs; gray
  community description and smaller ™; centered totals in four tie-dye circles
  with smaller figures; two runs with descriptions (taller rows); interactive
  vector hill profiles; vector topography; gray footer with a tone-on-tone logo;
  the floating Questions button; no visible sample/provisional badges.
- **Accepted exceptions, not WCAG AA compliant (unchanged):** the hero headline
  (solid white, no halo, ≈ 1.4–1.9:1) and the Just show up body copy (≈ 3.6–3.8:1) —
  Owner decision, 2026-11-08.
- **Earlier reviewed deviations** are listed in `.aiom/work/implement-cmr-homepage.md`
  ("Design-to-code deviations").
- **Run times and order** depend on when the page was built; Figma shows a fixed
  sample week.
- Overlays are visual evidence, not proof of pixel-perfect fidelity. Geometry
  that is asserted lives in `tests/e2e/home.spec.ts` and `shared-ui.spec.ts`.
