// Brand Standards (/brand): the values the manual prints are the values the site
// uses. These tests check the manual's data layer against its sources (the
// stylesheets, src/lib/headings.ts, the gradient bake script), its arithmetic,
// and that the committed PDF is the current manual.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { chapters, getChapter } from "@/content/brand";
import { contrast, formatCmykUnproofed, formatHsl, formatRatio, formatRgb, mixSrgb, overlay, wcagGrade } from "@/lib/brand/color";
import { CHAPTER_SLUGS, LANDING_SECTIONS, MANUAL, MANUAL_ADDRESS, brandPaths, chapterPath, outlineOf, pdfPageMap, plateNumber } from "@/lib/brand/manual";
import { allColors, colorById, core, cream, functional, mint, neutrals, tints } from "@/lib/brand/palette";
import { BADGE, BADGE_RATIO, HEADING_ROLES, MESH_GRADIENT, WORDMARK, meshHex, type HeadingRoleKey } from "@/lib/brand/spec";
import { cssVar, parseDeclarations, resolveValue } from "@/lib/brand/tokens";
import { AVOID_WORDS, checkHeadline, headlinePasses } from "@/lib/brand/voice";
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "@/components/brand/wordmark-path";
import { fluidType } from "@/lib/fluid";
import * as headings from "@/lib/headings";
import { sitemapPaths } from "@/lib/sitemap-paths";

const root = resolve(__dirname, "..", "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const oracle = JSON.parse(read("tokens/mwds/validation/cmr.resolved.json")) as { values: Record<string, string> };

describe("color arithmetic", () => {
  it("computes WCAG contrast: 21:1 for black on white, symmetric, 1:1 for a color on itself", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrast("#737373", "#737373")).toBeCloseTo(1, 5);
    // The site's own recorded figures (src/styles/cmr.css, src/components/home/CommunityIntro.tsx).
    expect(contrast("#737373", "#ffffff")).toBeCloseTo(4.74, 1);
    expect(contrast("#737373", "#f5f5f5")).toBeCloseTo(4.35, 1);
  });

  it("never rounds a ratio up across a threshold", () => {
    expect(formatRatio(4.499)).toBe("4.49:1");
    expect(formatRatio(21)).toBe("21.00:1");
  });

  it("grades against WCAG 2.2 text thresholds", () => {
    expect(wcagGrade(7)).toBe("AAA");
    expect(wcagGrade(6.99)).toBe("AA");
    expect(wcagGrade(4.5)).toBe("AA");
    expect(wcagGrade(4.49)).toBe("AA large");
    expect(wcagGrade(3)).toBe("AA large");
    expect(wcagGrade(2.99)).toBe("Fail");
  });

  it("formats RGB, HSL and device CMYK", () => {
    expect(formatRgb("#ddffea")).toBe("221 255 234");
    expect(formatHsl("#000000")).toBe("0° 0% 0%");
    expect(formatHsl("#ffffff")).toBe("0° 0% 100%");
    expect(formatCmykUnproofed("#000000")).toBe("0 0 0 100");
    expect(formatCmykUnproofed("#ffffff")).toBe("0 0 0 0");
    expect(formatCmykUnproofed("#ddffea")).toBe("13 0 8 0");
  });

  it("mixes and overlays in sRGB as the browser does", () => {
    expect(mixSrgb("#000000", "#ffffff", 0.5)).toBe("#808080");
    // 70% black on white: the site's body text color (src/lib/headings.ts BODY_TEXT_COLOR, "≈ #4d4d4d").
    expect(overlay("#000000", "#ffffff", 0.7)).toBe("#4d4d4d");
  });
});

describe("token resolution (the manual reads the site's stylesheets)", () => {
  it("resolves public MWDS names to the values Figma resolves", () => {
    expect(cssVar("primary")).toBe(oracle.values["semantic colors/general/primary"]);
    expect(cssVar("background")).toBe(oracle.values["semantic colors/general/background"]);
    expect(cssVar("accent")).toBe(oracle.values["semantic colors/general/accent"]);
    expect(cssVar("muted-foreground")).toBe(oracle.values["semantic colors/general/muted foreground"]);
    expect(cssVar("border")).toBe(oracle.values["semantic colors/general/border"]);
    expect(cssVar("secondary")).toBe(oracle.values["semantic colors/general/secondary"]);
  });

  it("resolves every brand neutral and mint step that Figma's oracle covers", () => {
    for (const [path, hex] of Object.entries(oracle.values)) {
      const m = path.match(/^brand colors\/brand-(neutrals|shades)\/(\d+)$/);
      if (!m) continue;
      expect(cssVar(`mwd-brand-brand-${m[1]}-${m[2]}`), path).toBe(hex);
    }
  });

  it("resolves the CMR layer, including the footer ink's color-mix", () => {
    expect(cssVar("cmr-tint-peach-wash")).toBe("#fff6ef");
    expect(cssVar("cmr-tint-mint-dye")).toBe(cssVar("mwd-raw-cmr-mint-100"));
    expect(cssVar("cmr-contour-on-light")).toBe("#d4d4d4");
    // 80% neutral 500 + 20% neutral 600 (src/styles/cmr.css: "≈ #6c6c6c, 4.8:1 on surface").
    expect(cssVar("cmr-quiet-ink")).toBe("#6c6c6c");
    expect(contrast(cssVar("cmr-quiet-ink"), cssVar("muted"))).toBeGreaterThanOrEqual(4.5);
  });

  it("reads only the first :root block, so scoped overrides (.science-dark) never leak in", () => {
    const decls = parseDeclarations(":root { --a: #111111; --b: var(--a); } .dark { --a: #eeeeee; } :root:has(x) { --a: #ff0000; }");
    expect(resolveValue("var(--b)", decls)).toBe("#111111");
    // The real file: --background is white at :root and black inside .science-dark.
    expect(cssVar("background")).toBe("#ffffff");
  });

  it("fails loudly on an unknown name or a cycle", () => {
    expect(() => cssVar("no-such-token")).toThrow(/not declared/);
    expect(() => resolveValue("var(--x)", new Map([["x", "var(--y)"], ["y", "var(--x)"]]))).toThrow(/cycle/);
  });
});

describe("palette", () => {
  it("gives every color a 6-digit hex and a unique id", () => {
    const all = allColors();
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    for (const c of all) expect(c.hex, c.id).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("has black and white as the core, an 11-step neutral and mint ramp, cream, and six tint pairs", () => {
    expect(core.map((c) => c.hex)).toEqual(["#000000", "#ffffff"]);
    expect(neutrals).toHaveLength(11);
    expect(mint).toHaveLength(11);
    expect(cream.hex).toBe("#f4f1e8");
    expect(tints.map((t) => t.name)).toEqual(["mint", "peach", "lavender", "blue", "mauve", "gray"]);
    expect(colorById("accent").hex).toBe(colorById("mint-100").hex);
  });

  it("keeps black type on every tint at AAA, as the manual states", () => {
    for (const t of tints) {
      expect(contrast("#000000", t.wash.hex), t.name).toBeGreaterThanOrEqual(7);
      expect(contrast("#000000", t.dye.hex), t.name).toBeGreaterThanOrEqual(7);
    }
  });

  it("names a real custom property for every functional color", () => {
    for (const c of functional) expect(cssVar(c.cssVar)).toBe(c.hex);
  });
});

describe("specification mirrors", () => {
  it("heading roles match src/lib/headings.ts exactly", () => {
    for (const key of Object.keys(HEADING_ROLES) as HeadingRoleKey[]) {
      const role = HEADING_ROLES[key];
      expect(headings[key](), key).toEqual(fluidType(role.size, role.lineHeight));
    }
    expect(Object.keys(HEADING_ROLES).sort()).toEqual(["displayLarge", "displayXL", "impactH2", "pageH1", "standardH2"]);
  });

  it("the gradient's control colors match the bake script", () => {
    const script = read("scripts/assets/bake-mesh-gradient.mjs");
    const points = [...script.matchAll(/p(\d)(\d): \{ x: \d+, y: \d+, c: \[([^\]]+)\] \}/g)];
    expect(points).toHaveLength(16);
    for (const [, col, row, c] of points) {
      const rgb = c.split(",").map((v) => Math.round(Number(v) * 100) / 100);
      expect(MESH_GRADIENT[Number(row)][Number(col)], `p${col}${row}`).toEqual(rgb);
    }
    expect(meshHex(MESH_GRADIENT[0][0])).toBe("#ff6b6b");
  });

  it("badge and wordmark measurements are internally consistent with the artwork files", () => {
    expect(read("public/brand/cmr-logo-mask-shape.svg")).toContain(`width="${BADGE.raster.w}" height="${BADGE.raster.h}"`);
    expect(BADGE_RATIO).toBeCloseTo(2.28, 2);
    expect(BADGE.lozenge.x + BADGE.lozenge.w).toBeLessThanOrEqual(BADGE.raster.w);
    expect(read("public/brand/cmr-wordmark.svg")).toContain(`viewBox="0 0 ${WORDMARK.traced.w} ${WORDMARK.traced.h}"`);
    // Three lines of equal cap height and two gaps fill the traced height (to within the 2 px trim margin).
    expect(3 * WORDMARK.traced.capHeight + 2 * WORDMARK.traced.lineGap).toBeGreaterThanOrEqual(WORDMARK.traced.h - 2);
    expect(WORDMARK.trackingPx / WORDMARK.fontSizePx).toBeCloseTo(-1 / 64, 4);
  });

  it("the manual's badge images are the approved mask's own pixels (alpha = the mask), in one flat color each", async () => {
    const sharp = (await import("sharp")).default;
    const b64 = read("public/brand/cmr-logo-mask-shape.svg").match(/base64,([^"]+)"/)![1];
    const mask = await sharp(Buffer.from(b64, "base64")).greyscale().raw().toBuffer({ resolveWithObject: true });
    for (const [name, value] of [["black", 0], ["white", 255]] as const) {
      const img = await sharp(resolve(root, `src/components/brand/art/cmr-badge-${name}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([img.info.width, img.info.height]).toEqual([BADGE.raster.w, BADGE.raster.h]);
      let wrong = 0;
      for (let i = 0; i < mask.data.length; i++) {
        const [r, g, b, a] = [img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2], img.data[i * 4 + 3]];
        if (a !== mask.data[i] || (a > 0 && (r !== value || g !== value || b !== value))) wrong++;
      }
      expect(wrong, name).toBe(0);
    }
  });

  it("the manual's inline wordmark is the approved traced path, unchanged", () => {
    const file = read("public/brand/cmr-wordmark.svg");
    expect(file.match(/<path d="([^"]+)"/)![1]).toBe(WORDMARK_PATH);
    expect(file).toContain(`viewBox="${WORDMARK_VIEWBOX}"`);
  });

  it("the proposed vector badge shares the approved raster's frame and is labeled as proposed", () => {
    const svg = read("public/brand/proposed/cmr-badge-proposed.svg");
    expect(svg).toContain(`viewBox="0 0 ${BADGE.raster.w} ${BADGE.raster.h}"`);
    expect(svg).toMatch(/PROPOSED/);
    expect(svg).toMatch(/Not approved/);
  });
});

describe("chapters", () => {
  it("are the ten chapters, in order, numbered 01 to 10", () => {
    expect(chapters.map((c) => c.slug)).toEqual([...CHAPTER_SLUGS]);
    expect(chapters.map((c) => c.number)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  });

  it("each have a title ending in a period, a one-sentence summary and at least five plates", () => {
    for (const c of chapters) {
      expect(c.title, c.slug).toMatch(/\.$/);
      expect(c.summary.length, c.slug).toBeGreaterThan(60);
      expect(c.plates.length, c.slug).toBeGreaterThanOrEqual(5);
    }
  });

  it("have plates with unique anchor ids, short nav labels and titles that end", () => {
    for (const c of chapters) {
      const ids = c.plates.map((p) => p.id);
      expect(new Set(ids).size, c.slug).toBe(ids.length);
      for (const p of c.plates) {
        expect(p.id, `${c.slug}/${p.id}`).toMatch(/^[a-z][a-z0-9-]*$/);
        expect(p.title, `${c.slug}/${p.id}`).toMatch(/[.?]$/);
        expect(p.nav.length, `${c.slug}/${p.id}`).toBeLessThanOrEqual(20);
        // Reserved by the chapter page itself.
        expect(["chapter-heading", "main"]).not.toContain(p.id);
      }
    }
  });

  it("mark every plate with an evidence level", () => {
    for (const c of chapters) for (const p of c.plates) expect(p.status, `${c.slug}/${p.id}`).toBeDefined();
  });

  it("present nothing in Apparel as established: it is all proposal or open", () => {
    expect(getChapter("apparel")!.plates.map((p) => p.status)).not.toContain("established");
  });

  it("build paths, numbers and outlines", () => {
    expect(chapterPath("color")).toBe("/brand/color");
    expect(plateNumber(chapters[2], 1)).toBe("03.2");
    const outline = outlineOf(chapters[0]);
    expect(outline.sections).toHaveLength(chapters[0].plates.length);
    expect(JSON.parse(JSON.stringify(outline))).toEqual(outline); // serializable for the client bar
    expect(LANDING_SECTIONS.map((s) => s.id)).toEqual(["essentials", "chapters", "how-to-read", "download"]);
  });
});

describe("sitemap and addresses", () => {
  it("lists the landing page and every chapter, and never the print route", () => {
    const paths = sitemapPaths();
    expect(brandPaths()).toEqual(["/brand", ...CHAPTER_SLUGS.map((s) => `/brand/${s}`)]);
    for (const p of brandPaths()) expect(paths).toContain(p);
    expect(paths).not.toContain("/brand/print");
  });

  it("prints the manual's address from the one production origin", () => {
    expect(MANUAL_ADDRESS).toMatch(/^[a-z]+\.com\/brand$/);
    expect(MANUAL_ADDRESS).not.toMatch(/^www\./);
  });
});

describe("PDF pagination", () => {
  it("numbers pages arithmetically: cover, contents, then an opener and its plates per chapter, then the colophon", () => {
    const map = pdfPageMap([
      { slug: "a", plates: [1, 2, 3] as never[] },
      { slug: "b", plates: [1] as never[] },
    ]);
    expect(map.chapters).toEqual([
      { slug: "a", opener: 3, firstPlate: 4 },
      { slug: "b", opener: 7, firstPlate: 8 },
    ]);
    expect(map.colophon).toBe(9);
    expect(map.total).toBe(9);
  });

  it("the committed PDF is the current manual: a real PDF with exactly the pages the chapters declare", () => {
    const file = resolve(root, MANUAL.pdfFile);
    expect(existsSync(file), `${MANUAL.pdfFile} is missing. Run npm run brand:pdf (see docs/brand-standards.md).`).toBe(true);
    const bytes = readFileSync(file);
    expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    const counts = [...bytes.toString("latin1").matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
    expect(counts.length, "page count not readable from the PDF").toBeGreaterThan(0);
    expect(Math.max(...counts), "The PDF is stale: rebuild it with npm run brand:pdf.").toBe(pdfPageMap(chapters).total);
    expect(MANUAL.pdfHref).toBe(`/${MANUAL.pdfFile.replace(/^public\//, "")}`);
  });
});

describe("headline checks (Voice)", () => {
  it("pass the site's own headlines", () => {
    for (const h of ["Bad weather. Good hills.", "New here? Good.", "Hills on repeat.", "JUST SHOW UP.", "FLAT IS A STATE OF MIND.", "The hill at Montrose.", "From mountains to molehills."]) {
      expect(headlinePasses(h), h).toBe(true);
    }
  });

  it("flag a missing full stop, an exclamation mark, Title Case, length and stock motivation", () => {
    const failing = (text: string) => checkHeadline(text).filter((c) => !c.pass).map((c) => c.id);
    expect(failing("Hills on repeat")).toEqual(["ending"]);
    expect(failing("Bad weather. Good hills!")).toEqual(["ending", "exclamation"]);
    expect(failing("Join Us For A Run.")).toEqual(["case"]);
    expect(failing("We run up and down the same small hill over and over again.")).toEqual(["length"]);
    expect(failing("Crush the hill.")).toEqual(["words"]);
    expect(failing("")).toContain("length");
  });

  it("allows proper nouns in sentence case and treats all caps as a statement", () => {
    expect(headlinePasses("The hill at Warren Park.")).toBe(true);
    expect(headlinePasses("The hill at Schiller Woods.")).toBe(true);
    expect(headlinePasses("See you at Cricket hill.")).toBe(true);
    expect(headlinePasses("The Hill at Warren Park.")).toBe(false);
    expect(headlinePasses("MAKE YOUR OWN MTNS.")).toBe(true);
    expect(AVOID_WORDS).toContain("epic");
  });
});
