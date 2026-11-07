# Design tokens (MWDS → CMR)

**Figma is the source of truth.** This directory holds a version-controlled,
checksummed export of the MWDS ("MWD x Shadcn DS") variables, which Style
Dictionary compiles to CSS. Nothing in `tokens/mwds/` or
`src/styles/generated/` is edited by hand. To change a token, change it in
Figma, then re-export.

```
Figma MWDS variables (H08HgMeVx6V23wY7aZdENf)
  → scripts/tokens/figma-export.js       Plugin API export, run via Figma MCP (read-only)
  → scripts/tokens/import-export.mjs     checksum-verified write to tokens/mwds/
  → tokens/mwds/**/*.tokens.json         DTCG source, aliases + modes + provenance
  → scripts/tokens/build.mjs             Style Dictionary 5 (npm run tokens:build)
  → src/styles/generated/mwds-tokens.css            internal --mwd-* chain + public API
  → src/styles/generated/mwds-tailwind-theme.css    Tailwind v4 @theme inline bridge
  → src/app/globals.css                  imports both; default Tailwind palette removed
```

## Layout

| Path | What it is |
|---|---|
| `mwds/<collection>/<mode>.tokens.json` | One file per Figma collection × exported mode, in [DTCG](https://www.designtokens.org/) format. Figma variable paths (`general/primary foreground`) become nested groups. Aliases stay aliases (`"{brand colors.brand-shades.100}"`). Figma scopes, descriptions, and `hiddenFromPublishing` are kept under `$extensions["com.figma"]`. |
| `mwds/manifest.json` | Provenance: source file key, export time, exporter version; for every collection its key, all source modes, the exported modes, and counts; the **theme mode pairing**; excluded collections with reasons; and an FNV-1a checksum per token file. |
| `mwds/validation/cmr.resolved.json` | An independent oracle: what *Figma's own resolver* returns for each MWDS color on a real CMR node (`NewsletterForm`, 1:324). Tests compare the generated CSS against it. |
| `mapping.mjs` | The public contract: which MWDS tokens are exposed under shadcn-style names (`--primary`, `--border`, …) and in which Tailwind namespaces. Edited deliberately; never inferred. |

## Modes and themes

`semantic colors` aliases into `brand colors`, and **both** collections have a
`cmr` mode. In Figma, CMR frames set *both* explicitly. A frame that sets only
`semantic colors = cmr` resolves `accent` to MWDS blue, not CMR mint. The
manifest therefore records the pairing as a theme:

```json
"themes": { "cmr": { "semantic colors": "cmr", "brand colors": "cmr" } }
```

The build selects each collection's file from that pairing; single-mode
collections use their only mode. Only the `cmr` modes are exported, because
CMR consumes no other mode. `shadcn`, `shadcn-dark`, and `mglo*` are recorded
in the manifest's `sourceModes` but are not exported. To add a mode (for
example a future `cmr-dark`), add it to the exporter `CONFIG` and add a theme.

`raw colors` and `alpha` are exported as the **alias closure**: only
primitives reachable from exported tokens, plus every `cmr/*` primitive. The
other 248 Tailwind-palette primitives aren't CMR tokens.
`chart colors` is excluded because it has no `cmr` mode.

## Output naming

- Internal: `--mwd-<collection>-<path>` with prefixes `raw`, `alpha`, `brand`,
  `color` (semantic), `space`, `space-abs`, `radius`, `radius-abs`, `type`,
  `shadow`. These preserve Figma's alias chain as `var()` indirection. They
  are implementation detail; components should not reference them, except
  where an MWDS component binds a token with no public name (the Input's
  9.5px padding).
- Public (`:root`): shadcn names plus the MWDS state tokens (`--primary-hover`,
  `--border-4`, `--ring-error`, …), `--radius`, and `--space-*`.
- Tailwind (`@theme inline`): `bg-primary`, `text-muted-foreground`,
  `rounded-lg`, `shadow-xs`, `text-p-sm` / `text-p` / `text-p-lg` /
  `text-h1…h4`, `font-medium`, and the numeric spacing scale (`p-4` = MWDS
  `spacing (absolute)/4` = 16px; tests assert the 4px grid holds).

Units: dimensions are px, except font sizes and line heights, which are rem
(÷16) so they respect browser font-size settings. MWDS `alpha` tokens
("alias + opacity") are emitted as resolved `rgb(… / a)`, because CSS has no
portable alias-with-opacity. The alias stays in the source file.

## Re-exporting from Figma

Figma's Variables REST API is Enterprise-only (the same constraint
`mwd-x-shadcn` documents), so export runs through the Plugin API:

1. Run `scripts/tokens/figma-export.js` against file `H08HgMeVx6V23wY7aZdENf`
   with Figma MCP `use_figma` (or the Figma desktop dev console). `use_figma`
   caps responses at about 48 KB, so run it twice with `CONFIG.only` set to
   the color collections, then to the rest. Only one page needs to return the
   full manifest.
2. Save each response verbatim and run
   `npm run tokens:import -- page1.json page2.json`. Every file is verified
   against the checksum Figma computed; a mismatch aborts.
3. Run `scripts/tokens/figma-resolve-oracle.js` against the **CMR** file
   (`hLEeAchFtgd1WFtboIChil`) and save the result as
   `mwds/validation/cmr.resolved.json`.
4. `npm run tokens:build && npm test`.

## Guarantees (enforced by `npm test` and CI)

- Token files match their export checksums, so a hand edit fails the build.
- Every color in the oracle resolves identically through the generated CSS.
- The CMR theme pairs both collections' `cmr` modes.
- Every public mapping entry resolves to a real color.
- Committed CSS equals a fresh build (`npm run tokens:check` in CI).
- Tailwind's default color palette is removed (`src/styles/theme-reset.css`),
  so `text-zinc-600`-style utilities cannot form a second token system.
