#!/usr/bin/env node
/**
 * Builds the homepage hero (public/home/hero.jpg) from the Owner's original
 * photograph — homepage Round 2.1.
 *
 *   source  scripts/assets/source/hero-original.jpg (1920×2560, supplied by the
 *           Owner 2026-11-08; Cricket Hill, runner on the crest)
 *   output  public/home/hero.jpg (1920×1900)
 *
 * What the approved Figma frame is: this same photograph with the hill stretched
 * vertically (steeper crest and track), extra sky above, and a more saturated
 * color grade. The original is used UNSTRETCHED here — the hill keeps its real
 * shape — so the composition is recovered by cropping, not by distorting:
 *
 *   1. Crop the top 1900 of 2560 rows at full width. The grass below is dropped,
 *      which puts the crest (row ~1410) ~74% down the file; CSS object-position
 *      then places it ~72% down the hero on desktop, as in the approved frame.
 *   2. A light grade toward the approved look, measured from the two images:
 *      the approved sky is bluer (saturation ≈ 0.23 vs 0.14) and its grass
 *      brighter and more saturated (≈ 0.96 vs 0.65). Saturation ×1.5 and a
 *      midtone lift (gamma 1.2), chosen by eye against the approved frame from
 *      three candidates — nothing else; no sharpening, no resampling.
 *
 * Deterministic; nothing is generated or added. `--plain` skips the grade.
 *
 *   node scripts/assets/build-hero.mjs [--plain] [out.jpg]
 *
 * `sharp` comes from Next's install (not a direct dependency).
 */
import sharp from "sharp";

const args = process.argv.slice(2);
const plain = args.includes("--plain");
const out = args.find((a) => !a.startsWith("--")) ?? "public/home/hero.jpg";

const SRC = "scripts/assets/source/hero-original.jpg";
const CROP_ROWS = 1900;

let img = sharp(SRC).extract({ left: 0, top: 0, width: 1920, height: CROP_ROWS });
if (!plain) img = img.modulate({ saturation: 1.5 }).gamma(1.2);
await img.jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" }).toFile(out);
console.log(`wrote ${out} (1920×${CROP_ROWS}${plain ? ", ungraded" : ", graded"})`);
