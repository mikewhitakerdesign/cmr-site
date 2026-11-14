// Brand Standards (/brand): the values the manual prints are the values the site
// uses. These tests check the manual's data layer against its sources (the
// stylesheets, src/lib/headings.ts, the gradient bake script), its arithmetic,
// and that the committed PDF is the current manual.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { chapters, getChapter } from "@/content/brand";
import { contrast, formatCmykUnproofed, formatHsl, formatRatio, formatRgb, mixSrgb, overlay, wcagGrade } from "@/lib/brand/color";
import { CHAPTER_SLUGS, LANDING_SECTIONS, LOGO_DOWNLOADS, MANUAL, MANUAL_ADDRESS, STATUS, brandPaths, chapterPath, outlineOf, pdfPageMap, plateNumber } from "@/lib/brand/manual";
import { allColors, colorById, functional, neutrals, primary, tints } from "@/lib/brand/palette";
import { BADGE, BADGE_RATIO, HEADING_ROLES, MESH_GRADIENT, MESH_OPACITY, WORDMARK, meshHex, type HeadingRoleKey } from "@/lib/brand/spec";
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

  it("is pure black and white with the unchanged neutral scale as Primary, and six wash and dye families as Secondary (Review 01)", () => {
    expect(primary.map((c) => c.hex)).toEqual(["#000000", "#ffffff"]);
    expect(neutrals).toHaveLength(11);
    // The neutral scale is unchanged (Owner decision, Review 01): these are its values, 50 to 950.
    expect(neutrals.map((n) => n.hex)).toEqual(["#ffffff", "#f5f5f5", "#ececec", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#404040", "#262626", "#171717", "#000000"]);
    expect(tints.map((t) => t.name)).toEqual(["mint", "peach", "lavender", "blue", "mauve", "gray"]);
    // No standalone mint ramp and no cream in the documented palette.
    const ids = allColors().map((c) => c.id);
    expect(ids.filter((id) => /^mint-\d+$/.test(id) || id === "cream")).toEqual([]);
    // The interface accent is still documented, as a working color, and is the mint dye's value.
    expect(colorById("accent").hex).toBe(colorById("mint-dye").hex);
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
    expect(BADGE_RATIO).toBeCloseTo(2.29, 2);
    expect(BADGE.raster.crop.x + BADGE.master.w).toBeLessThanOrEqual(BADGE.raster.w);
    expect(read(`public${LOGO_DOWNLOADS.dir}/cmr-badge-black.svg`)).toContain(`viewBox="0 0 ${BADGE.master.w} ${BADGE.master.h}"`);
    expect(read(`public${LOGO_DOWNLOADS.dir}/cmr-wordmark-black.svg`)).toContain(`viewBox="0 0 ${WORDMARK.master.w} ${WORDMARK.master.h}"`);
    // The footer's earlier trace: three lines of equal cap height and two gaps fill its height (to within the 2 px trim margin).
    expect(read("public/brand/cmr-wordmark.svg")).toContain(`viewBox="0 0 ${WORDMARK.traced.w} ${WORDMARK.traced.h}"`);
    expect(3 * WORDMARK.traced.capHeight + 2 * WORDMARK.traced.lineGap).toBeGreaterThanOrEqual(WORDMARK.traced.h - 2);
    expect(WORDMARK.trackingPx / WORDMARK.fontSizePx).toBeCloseTo(-1 / 64, 4);
    // The master's caps: 0.71 em (Geist) at the specified size, overshot by the round letters at the top.
    expect(WORDMARK.master.capHeight).toBeCloseTo(0.71 * WORDMARK.fontSizePx, 1);
  });

  it("the manual's inline wordmark is the vector master's path, unchanged", () => {
    const file = read(`public${LOGO_DOWNLOADS.dir}/cmr-wordmark-black.svg`);
    expect(file.match(/ d="([^"]+)"/)![1]).toBe(WORDMARK_PATH);
    expect(file).toContain(`viewBox="${WORDMARK_VIEWBOX}"`);
  });

  it("the homepage hero's gradient is the manual's 25%, and Just show up keeps 50%", () => {
    expect(MESH_OPACITY).toEqual({ hero: 25, justShowUp: 50 });
    expect(read("src/components/home/HomeHero.tsx")).toMatch(new RegExp(`gradientOpacity="${MESH_OPACITY.hero}"`));
    expect(read("src/components/home/JustShowUp.tsx")).toMatch(new RegExp(`gradientOpacity="${MESH_OPACITY.justShowUp}"`));
  });
});

describe("logo files and site icon (Marks › Files)", () => {
  const logo = (f: string) => resolve(root, `public${LOGO_DOWNLOADS.dir}/${f}`);
  const MARKS = ["badge", "wordmark"] as const;

  it("are genuine vector masters: one filled path each, no embedded image, black and white versions of the same artwork", () => {
    for (const m of MARKS) {
      const black = read(`public${LOGO_DOWNLOADS.dir}/cmr-${m}-black.svg`);
      const white = read(`public${LOGO_DOWNLOADS.dir}/cmr-${m}-white.svg`);
      for (const svg of [black, white]) {
        expect(svg, m).not.toMatch(/<image|base64|<rect/i);
        expect(svg.match(/<path /g), m).toHaveLength(1);
        expect(svg, m).toMatch(/viewBox="0 0 [\d.]+ [\d.]+"/);
      }
      expect(black).toContain('fill="#000"');
      expect(white).toContain('fill="#fff"');
      expect(black.match(/ d="([^"]+)"/)![1], m).toBe(white.match(/ d="([^"]+)"/)![1]);
    }
    // The badge: the outline and six knocked-out shapes (C, M, R, the R's counter, and the ™'s T and M).
    const d = read(`public${LOGO_DOWNLOADS.dir}/cmr-badge-black.svg`).match(/ d="([^"]+)"/)![1];
    expect(d.match(/M /g)).toHaveLength(7);
  });

  it("the badge master reproduces the approved artwork: under 0.5% of its inked pixels differ, all at the edge", async () => {
    const sharp = (await import("sharp")).default;
    const b64 = read("public/brand/cmr-logo-mask-shape.svg").match(/base64,([^"]+)"/)![1];
    const mask = await sharp(Buffer.from(b64, "base64")).greyscale().raw().toBuffer({ resolveWithObject: true });
    const { w, h } = BADGE.raster;
    const body = read(`public${LOGO_DOWNLOADS.dir}/cmr-badge-black.svg`).match(/<path [^>]+>/)![0];
    const placed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><g transform="translate(${BADGE.raster.crop.x} ${BADGE.raster.crop.y})">${body}</g></svg>`;
    const vec = await sharp(Buffer.from(placed)).flatten({ background: "#ffffff" }).greyscale().negate().raw().toBuffer();
    let inked = 0;
    let differ = 0;
    for (let i = 0; i < w * h; i++) {
      if (mask.data[i] >= 128) inked++;
      if (mask.data[i] >= 128 !== vec[i] >= 128) differ++;
    }
    expect(differ / inked).toBeLessThan(0.005);
  });

  it("PNGs are 3000 px wide, transparent, in the master's proportions", async () => {
    const sharp = (await import("sharp")).default;
    for (const m of MARKS) {
      const master = m === "badge" ? BADGE.master : WORDMARK.master;
      for (const ink of ["black", "white"]) {
        const img = sharp(logo(`cmr-${m}-${ink}.png`));
        const meta = await img.metadata();
        expect(meta.format).toBe("png");
        expect(meta.hasAlpha, `${m} ${ink}`).toBe(true);
        expect(meta.width).toBe(3000);
        expect(meta.height! / meta.width!).toBeCloseTo(master.h / master.w, 2);
        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        expect(data[3], "top-left corner is transparent").toBe(0);
        expect(data[(info.width * info.height - 1) * 4 + 3], "bottom-right corner is transparent").toBe(0);
      }
    }
  });

  it("the ZIP holds the eight files, byte for byte, and a README", async () => {
    const { inflateRawSync } = await import("node:zlib");
    const zip = readFileSync(logo("cmr-logos.zip"));
    const entries = new Map<string, Buffer>();
    for (let o = 0; zip.readUInt32LE(o) === 0x04034b50; ) {
      const method = zip.readUInt16LE(o + 8);
      const size = zip.readUInt32LE(o + 18);
      const nameLen = zip.readUInt16LE(o + 26);
      const name = zip.subarray(o + 30, o + 30 + nameLen).toString("utf8");
      const body = zip.subarray(o + 30 + nameLen, o + 30 + nameLen + size);
      entries.set(name, method === 8 ? inflateRawSync(body) : Buffer.from(body));
      o += 30 + nameLen + size;
    }
    const files = MARKS.flatMap((m) => ["black", "white"].flatMap((ink) => [`cmr-${m}-${ink}.svg`, `cmr-${m}-${ink}.png`]));
    expect([...entries.keys()].sort()).toEqual([...files.map((f) => `cmr-logos/${f}`), "cmr-logos/README.txt"].sort());
    for (const f of files) expect(entries.get(`cmr-logos/${f}`)!.equals(readFileSync(logo(f))), f).toBe(true);
    expect(entries.get("cmr-logos/README.txt")!.toString()).toMatch(/96 px/);
  });

  it("the site icon is the badge's outline alone: one shape, no letters, black on white", () => {
    const icon = read("src/app/icon.svg");
    const d = icon.match(/ d="([^"]+)"/)![1];
    expect(d.match(/M /g)).toHaveLength(1);
    expect(icon).toContain('fill="#fff"');
    expect(icon).toContain('fill="#000"');
    const ico = readFileSync(resolve(root, "src/app/favicon.ico"));
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    expect([0, 1, 2].map((i) => ico.readUInt8(6 + 16 * i))).toEqual([16, 32, 48]);
  });
});

describe("chapters", () => {
  it("are the nine published chapters, in order, numbered 01 to 09; Apparel is deferred and unpublished", () => {
    expect(chapters.map((c) => c.slug)).toEqual([...CHAPTER_SLUGS]);
    expect(chapters.map((c) => c.number)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09"]);
    expect(CHAPTER_SLUGS).not.toContain("apparel");
    expect(getChapter("apparel")).toBeUndefined();
    // Kept for a later edition.
    expect(existsSync(resolve(root, "src/content/brand/apparel.tsx"))).toBe(true);
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

  it("tag a plate only when something in it is unfinished, with one of the two tags", () => {
    for (const c of chapters) for (const p of c.plates) if (p.status) expect(Object.keys(STATUS), `${c.slug}/${p.id}`).toContain(p.status);
    expect(Object.keys(STATUS)).toEqual(["provisional", "pending"]);
  });

  it("is a release candidate of version 1.0, and says so", () => {
    expect(MANUAL.version).toBe("1.0");
    expect(MANUAL.status).toMatch(/release candidate/i);
    expect(MANUAL.pdfDownloadName).toBe("CMR-Brand-Standards-v1.0-RC.pdf");
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
