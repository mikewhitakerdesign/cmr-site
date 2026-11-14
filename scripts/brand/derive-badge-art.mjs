#!/usr/bin/env node
/**
 * Derives transparent PNGs of the approved CMR badge for the Brand Standards.
 *
 *   input   public/brand/cmr-logo-mask-shape.svg — the unmodified Figma export
 *           of "Brand / CMR logo" (39:152). It embeds a 1386 × 728 grayscale
 *           image: white = visible badge, black = knocked out or outside.
 *   output  src/components/brand/art/cmr-badge-black.png and -white.png, the
 *           same 1386 × 728 pixels, one flat color, with the mask's luminance as
 *           alpha (the letters and the outside are transparent).
 *
 * Why: the site draws the badge with a CSS mask. Chromium writes any masked box
 * into a PDF with a faint hairline along its edge, which showed as a rectangle
 * around every badge in the manual's PDF. A transparent image has no mask.
 * Nothing is redrawn or resampled: each output pixel is the approved mask's
 * pixel. The production badge (src/components/CmrLogo.tsx) is untouched.
 *
 * Usage: node scripts/brand/derive-badge-art.mjs   (sharp comes from Next's install)
 */
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "public/brand/cmr-logo-mask-shape.svg";
const OUT = "src/components/brand/art";
const b64 = readFileSync(SRC, "utf8").match(/xlink:href="data:image\/png;base64,([^"]+)"/)?.[1];
if (!b64) throw new Error(`${SRC} has no embedded image.`);
const { data, info } = await sharp(Buffer.from(b64, "base64")).greyscale().raw().toBuffer({ resolveWithObject: true });
mkdirSync(OUT, { recursive: true });
for (const [name, v] of [["black", 0], ["white", 255]]) {
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = data[i];
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${OUT}/cmr-badge-${name}.png`);
  console.log(`${OUT}/cmr-badge-${name}.png ${info.width}x${info.height}`);
}
