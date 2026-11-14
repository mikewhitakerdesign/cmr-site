import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mixSrgb } from "@/lib/brand/color";

/**
 * Resolves CMR's CSS custom properties to literal values for the Brand
 * Standards (/brand), from the two stylesheets the site itself ships:
 *
 *   src/styles/generated/mwds-tokens.css   MWDS tokens, generated from the Figma export
 *   src/styles/cmr.css (first :root block) the CMR application layer
 *
 * The manual therefore prints what the site renders. No colour value is typed
 * into a chapter: change the token (in Figma, then re-export) and the manual
 * follows on the next build. When MWDS becomes the token source for CMR, only
 * the two paths below and the variable names in ./palette.ts need to change.
 *
 * Server-only (reads files at build time). Every /brand page is static.
 */
const SOURCES = ["src/styles/generated/mwds-tokens.css", "src/styles/cmr.css"] as const;

/**
 * Each file is read with a literal path, so the bundler can see exactly which
 * two files this module needs and does not trace the whole project into the
 * build output.
 */
const readSources = (): string[] => [
  readFileSync(join(process.cwd(), "src", "styles", "generated", "mwds-tokens.css"), "utf8"),
  readFileSync(join(process.cwd(), "src", "styles", "cmr.css"), "utf8"),
];

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** The body of the first `:root { … }` block: later blocks (.science-dark, :has(...)) are scoped overrides. */
function firstRootBlock(css: string): string {
  const start = css.search(/:root\s*\{/);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}

export function parseDeclarations(css: string): Map<string, string> {
  const body = firstRootBlock(stripComments(css));
  return new Map([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

let cache: Map<string, string> | undefined;

function declarations(): Map<string, string> {
  if (!cache) {
    cache = new Map();
    for (const css of readSources()) {
      for (const [name, value] of parseDeclarations(css)) cache.set(name, value);
    }
  }
  return cache;
}

/** Follows `var()` chains (and one `color-mix(in srgb, …)`) to a literal. Throws on an unknown name or a cycle. */
export function resolveValue(value: string, decls: Map<string, string> = declarations(), seen = new Set<string>()): string {
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  if (ref) return resolveVar(ref[1], decls, seen);
  const mix = value.match(/^color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*(.+?)\)$/);
  if (mix) return mixSrgb(resolveValue(mix[1], decls, new Set(seen)), resolveValue(mix[3], decls, new Set(seen)), Number(mix[2]) / 100);
  return value;
}

export function resolveVar(name: string, decls: Map<string, string> = declarations(), seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`cycle at --${name}`);
  seen.add(name);
  const value = decls.get(name);
  if (value === undefined) throw new Error(`--${name} is not declared in ${SOURCES.join(" or ")}`);
  return resolveValue(value, decls, seen);
}

/** The literal a CSS custom property resolves to, e.g. `cssVar("accent")` → "#ddffea". */
export const cssVar = (name: string) => resolveVar(name);
