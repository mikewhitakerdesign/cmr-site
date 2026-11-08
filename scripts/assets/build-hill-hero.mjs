#!/usr/bin/env node
/**
 * Builds the Cricket Hill detail-page hero (public/hills/cricket-hill-hero.jpg)
 * from the Owner's original photograph — Chicago Hills milestone.
 *
 *   source  scripts/assets/source/hero-original.jpg (1920×2560, supplied by the
 *           Owner 2026-11-08; the same photograph as the homepage hero)
 *   output  public/hills/cricket-hill-hero.jpg (1920×1600, grayscale)
 *
 * The approved Hill Details frames (Figma 1:6673 / 1:7007 / 1:7336) fill the
 * hero with this photograph desaturated, inside the white mat of the low-res
 * copy the Owner first shared, under a 40–70% black gradient. Here the
 * original is used without the mat (the mat reads as a grey frame under the
 * gradient; it is an artifact of that copy, not a design element):
 *
 *   1. Crop rows 760–2360 at full width: the sky above the crest, the crest
 *      (row ~1410) and the worn track, the same framing as the matted image.
 *   2. Convert to grayscale. Nothing else: no sharpening, no resampling, no
 *      generated content. The gradient is CSS (HillHero), not baked in.
 *
 *   node scripts/assets/build-hill-hero.mjs [out.jpg]
 *
 * `sharp` comes from Next's install (not a direct dependency).
 */
import sharp from "sharp";

const out = process.argv[2] ?? "public/hills/cricket-hill-hero.jpg";
const SRC = "scripts/assets/source/hero-original.jpg";
const TOP = 760;
const ROWS = 1600;

await sharp(SRC)
  .extract({ left: 0, top: TOP, width: 1920, height: ROWS })
  .grayscale()
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out);
console.log(`wrote ${out} (1920×${ROWS}, grayscale, rows ${TOP}–${TOP + ROWS})`);
