// Token pipeline contract tests. These check the pipeline against Figma's
// own data rather than against itself:
//   - token files are byte-identical (by checksum) to what Figma exported,
//   - the generated CSS resolves every color exactly as Figma resolves it for
//     a real CMR consumer node (tokens/mwds/validation/cmr.resolved.json),
//   - the committed CSS is what a fresh Style Dictionary build produces.
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { build, cssName, sourceFiles } from "../scripts/tokens/build.mjs";
import { PUBLIC_COLORS } from "../tokens/mapping.mjs";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");
const manifest = JSON.parse(read("tokens/mwds/manifest.json"));
const oracle = JSON.parse(read("tokens/mwds/validation/cmr.resolved.json"));
const tokensCss = read("src/styles/generated/mwds-tokens.css");

const fnv1a = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

/** name → raw value from `--name: value;` declarations (comments stripped). */
const declarations = new Map(
  [...tokensCss.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
);

/** Follows var() chains to a literal, failing on cycles or missing targets. */
function resolveVar(name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`cycle at --${name}`);
  seen.add(name);
  const value = declarations.get(name);
  if (value === undefined) throw new Error(`--${name} is not declared`);
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  return ref ? resolveVar(ref[1], seen) : value;
}

/** #rrggbb[aa] or rgb(r g b / a) → [r, g, b, a]. */
function rgba(color: string): [number, number, number, number] {
  const hex = color.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) {
    const n = (s: string) => parseInt(s, 16);
    const h = hex[1];
    return [n(h.slice(0, 2)), n(h.slice(2, 4)), n(h.slice(4, 6)), hex[2] ? n(hex[2]) / 255 : 1];
  }
  const fn = color.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (fn) return [+fn[1], +fn[2], +fn[3], fn[4] ? +fn[4] : 1];
  throw new Error(`unparseable color ${color}`);
}

describe("token source integrity", () => {
  it("every token file still matches the checksum Figma computed at export (no hand edits)", () => {
    const files = Object.keys(manifest.checksums);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const compact = JSON.stringify(JSON.parse(read(file)));
      expect(fnv1a(compact), file).toBe(manifest.checksums[file]);
    }
  });

  it("has no token files that the manifest does not account for", () => {
    const onDisk = readdirSync(resolve(root, "tokens/mwds"), { recursive: true, encoding: "utf8" })
      .filter((f) => f.endsWith(".tokens.json"))
      .map((f) => `tokens/mwds/${f}`)
      .sort();
    expect(onDisk).toEqual(Object.keys(manifest.checksums).sort());
  });

  it("the cmr theme pairs semantic colors AND brand colors to their cmr modes", () => {
    // Verified in Figma: NewsletterForm sets both. Pairing only one would
    // resolve accent/border through the default (shadcn) brand mode.
    expect(manifest.themes.cmr).toEqual({ "semantic colors": "cmr", "brand colors": "cmr" });
    expect(sourceFiles("cmr")).toContain("tokens/mwds/brand-colors/cmr.tokens.json");
    expect(sourceFiles("cmr")).toContain("tokens/mwds/semantic-colors/cmr.tokens.json");
  });
});

describe("alias and mode resolution matches Figma", () => {
  const entries = Object.entries(oracle.values as Record<string, string>);

  it("covers the colors the CMR file actually uses", () => {
    expect(entries.length).toBe(44);
  });

  it.each(entries)("%s resolves to %s", (figmaName, expected) => {
    const path = figmaName.split("/");
    // "semantic colors/general/primary foreground" → collection + variable path
    const name = cssName(path);
    const actual = rgba(resolveVar(name));
    const want = rgba(expected);
    expect(actual.slice(0, 3)).toEqual(want.slice(0, 3));
    expect(actual[3]).toBeCloseTo(want[3], 2);
  });

  it("keeps the alias chain as CSS indirection instead of flattening it", () => {
    expect(declarations.get("accent")).toBe("var(--mwd-color-general-accent)");
    expect(declarations.get("mwd-color-general-accent")).toBe("var(--mwd-brand-brand-shades-100)");
    expect(declarations.get("mwd-brand-brand-shades-100")).toBe("var(--mwd-raw-cmr-mint-100)");
    expect(declarations.get("mwd-raw-cmr-mint-100")).toBe("#ddffea");
  });
});

describe("public contract", () => {
  it("every public color resolves to a literal color", () => {
    for (const [name] of PUBLIC_COLORS) expect(() => rgba(resolveVar(name)), name).not.toThrow();
  });

  it("MWDS primary is black and secondary is warm cream in the CMR theme (approved decision)", () => {
    expect(resolveVar("primary")).toBe("#000000");
    expect(resolveVar("secondary")).toBe("#f4f1e8");
    expect(resolveVar("accent")).toBe("#ddffea");
  });

  it("MWDS absolute spacing is a 4px grid, so Tailwind's numeric scale equals it", () => {
    expect(resolveVar("mwd-space-abs-1")).toBe("4px");
    for (const [name, value] of declarations) {
      const m = name.match(/^mwd-space-abs-(\d+)(?:-(\d+))?$/);
      if (!m) continue;
      const n = Number(`${m[1]}${m[2] ? `.${m[2]}` : ""}`);
      expect(value, name).toBe(n === 0 ? "0" : `${n * 4}px`);
    }
  });

  it("next/font loads the font families MWDS names", () => {
    expect(resolveVar("mwd-type-font-definitions-font-family-body")).toBe('"Geist"');
    expect(resolveVar("mwd-type-font-definitions-font-family-monospace")).toBe('"Geist Mono"');
    const layout = read("src/app/layout.tsx");
    expect(layout).toMatch(/import \{ Geist, Geist_Mono \} from "next\/font\/google"/);
  });
});

describe("generated output", () => {
  it("committed CSS is exactly what a fresh Style Dictionary build produces", async () => {
    const files = await build();
    for (const [dest, css] of Object.entries(files)) expect(read(dest), dest).toBe(css);
  });
});
