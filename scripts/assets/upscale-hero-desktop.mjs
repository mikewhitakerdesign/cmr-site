#!/usr/bin/env node
/**
 * Provisional desktop hero: a restrained 2× upscale of the approved Figma
 * fill (homepage Round 2, Owner direction 2026-11-08).
 *
 *   source  scripts/assets/source/hero-desktop-figma.jpg (768×1024, the
 *           approved Figma image fill on Hero 1:377, as committed in PR #3)
 *   output  public/home/hero-desktop.jpg (1536×2048)
 *
 * Lanczos-3 resampling, then a light unsharp mask on luminance edges only.
 * No generative model: nothing is added that is not in the source, so fine
 * texture (grass, the runner) stays as soft as the source — the upscale only
 * avoids the browser's bilinear smear and the optimizer re-encoding a tiny
 * image at 1.9–3.8× on desktop screens. Replace with a proper edit of the
 * original photograph (see public/home/README.md) before launch.
 *
 *   node scripts/assets/upscale-hero-desktop.mjs
 *
 * `sharp` comes from Next's install (not a direct dependency).
 */
import sharp from "sharp";

const SRC = "scripts/assets/source/hero-desktop-figma.jpg";
const OUT = "public/home/hero-desktop.jpg";

const { width, height } = await sharp(SRC).metadata();
await sharp(SRC)
  .resize(width * 2, height * 2, { kernel: "lanczos3" })
  .sharpen({ sigma: 0.9, m1: 0.3, m2: 1.4, x1: 3 })
  .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(OUT);
console.log(`wrote ${OUT} ${width * 2}×${height * 2}`);
