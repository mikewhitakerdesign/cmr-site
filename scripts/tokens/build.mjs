#!/usr/bin/env node
// Style Dictionary build: tokens/mwds/**/*.tokens.json → generated CSS.
//
//   npm run tokens:build   write src/styles/generated/*.css
//   npm run tokens:check   fail if the committed CSS differs from a fresh build
//
// Outputs (both GENERATED — never edit by hand):
//   mwds-tokens.css          framework-neutral: every MWDS token as an internal
//                            `--mwd-*` property (alias chain preserved as var()
//                            references), then the public shadcn-style API.
//   mwds-tailwind-theme.css  Tailwind v4 `@theme inline` bridge that only
//                            re-exports public/internal properties into
//                            Tailwind's namespaces. Adds no values of its own.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { formattedVariables } from "style-dictionary/utils";
import * as M from "../../tokens/mapping.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = "src/styles/generated";
const TOKENS_FILE = `${OUT_DIR}/mwds-tokens.css`;
const THEME_FILE = `${OUT_DIR}/mwds-tailwind-theme.css`;
const THEME = "cmr";

const manifest = JSON.parse(readFileSync(resolve(root, "tokens/mwds/manifest.json"), "utf8"));

/** Source files for a theme: each collection contributes the mode the theme selects. */
export function sourceFiles(theme = THEME) {
  const pairing = manifest.themes[theme];
  if (!pairing) throw new Error(`Unknown theme "${theme}"`);
  return manifest.collections.map((c) => {
    const modeName = pairing[c.name] ?? c.defaultMode;
    const mode = c.exportedModes.find((m) => m.name === modeName);
    if (!mode) throw new Error(`Theme "${theme}" needs ${c.name}/${modeName}, which was not exported.`);
    return mode.file;
  });
}

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const cssName = (path) => {
  const prefix = M.COLLECTION_PREFIX[path[0]];
  if (!prefix) throw new Error(`No CSS prefix for collection "${path[0]}"`);
  return `mwd-${prefix}-${path.slice(1).map(kebab).join("-")}`;
};

const figmaExt = (token) => token.$extensions?.["com.figma"] ?? {};
const REM_SCOPES = ["FONT_SIZE", "LINE_HEIGHT"];
const trim = (n) => String(Math.round(n * 1e4) / 1e4);

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
};

StyleDictionary.registerTransform({
  name: "mwds/name",
  type: "name",
  transform: (token) => cssName(token.path),
});
StyleDictionary.registerTransform({
  // DTCG dimension object → CSS length. Type sizes and line heights become
  // rem (16px root) so they respect the user's browser font size.
  name: "mwds/dimension",
  type: "value",
  transitive: true,
  filter: (token) => token.$type === "dimension",
  transform: (token) => {
    const v = token.$value;
    if (typeof v !== "object" || v === null) return v;
    if (v.unit !== "px") throw new Error(`${token.name}: unsupported unit ${v.unit}`);
    const remScoped = (figmaExt(token).scopes ?? []).some((s) => REM_SCOPES.includes(s));
    if (v.value === 0) return "0";
    return remScoped ? `${trim(v.value / 16)}rem` : `${trim(v.value)}px`;
  },
});
StyleDictionary.registerTransform({
  // MWDS `alpha` tokens are "alias + opacity". CSS can't alias-with-opacity
  // portably, so emit the resolved color with alpha; the alias stays in source.
  name: "mwds/color/alias-opacity",
  type: "value",
  transitive: true,
  filter: (token) => figmaExt(token).aliasOpacity !== undefined,
  transform: (token) => {
    const [r, g, b] = hexToRgb(token.$value);
    return `rgb(${r} ${g} ${b} / ${trim(figmaExt(token).aliasOpacity / 100)})`;
  },
});
StyleDictionary.registerTransform({
  name: "mwds/font-family",
  type: "value",
  filter: (token) => token.$type === "fontFamily",
  transform: (token) => `"${token.$value}"`,
});

const HEADER = (what) =>
  `/*\n * GENERATED FILE — DO NOT EDIT BY HAND.\n *\n * ${what}\n * Source: tokens/mwds/ (exported from Figma "${manifest.source.system}",\n * file ${manifest.source.figmaFileKey}, ${manifest.source.exportedAt}).\n * Theme: ${THEME} (${Object.entries(manifest.themes[THEME]).map(([c, m]) => `${c}=${m}`).join(", ")}).\n * Regenerate: npm run tokens:build. Public contract: tokens/mapping.mjs.\n */\n`;

function buildTokensCss(dictionary) {
  const byPath = new Map(dictionary.allTokens.map((t) => [t.path.join("."), t]));
  const ref = (dotted) => {
    const t = byPath.get(dotted);
    if (!t) throw new Error(`tokens/mapping.mjs references missing token "${dotted}"`);
    return `var(--${t.name})`;
  };

  const names = new Map();
  for (const t of dictionary.allTokens) {
    if (names.has(t.name)) throw new Error(`CSS name collision: --${t.name} for ${names.get(t.name)} and ${t.path.join(".")}`);
    names.set(t.name, t.path.join("."));
  }

  const internal = formattedVariables({
    format: "css",
    dictionary,
    // Keep Figma's alias chain as var() indirection — except alias+opacity
    // tokens, whose value must be the computed color.
    outputReferences: (token) => figmaExt(token).aliasOpacity === undefined,
    usesDtcg: true,
    formatting: { indentation: "  " },
  });

  const shadows = M.TAILWIND_SHADOWS.map((level) => {
    const group = [...byPath.keys()].filter((k) => k.startsWith(`shadows.${level}.`));
    const layers = group.some((k) => k.startsWith(`shadows.${level}.shadow `))
      ? [...new Set(group.filter((k) => k.includes(".shadow ")).map((k) => k.split(".").slice(0, 3).join(".")))].sort()
      : [`shadows.${level}`];
    const color = ref(`shadows.${level}.color`);
    const part = (layer, re) => {
      const key = group.find((k) => k.startsWith(layer + ".") && re.test(k.slice(layer.length + 1)));
      if (!key) throw new Error(`Shadow ${layer} is missing a part matching ${re}`);
      return ref(key);
    };
    const value = layers
      .map((l) => [part(l, /^x\d*$/), part(l, /^y$/), part(l, /^blur$/), part(l, /^spread$/), color].join(" "))
      .join(", ");
    return `  --mwd-shadow-${level}: ${value};`;
  });

  const pub = [
    ...M.PUBLIC_COLORS.map(([n, p]) => `  --${n}: ${ref(p)};`),
    ...M.PUBLIC_RADIUS.map(([n, p]) => `  --${n}: ${ref(p)};`),
    ...M.PUBLIC_SPACING.map(([n, p]) => `  --${n}: ${ref(p)};`),
  ];

  return (
    HEADER("Framework-neutral MWDS tokens. `--mwd-*` = internal (Figma alias chain); the last block is the public API.") +
    `\n:root {\n  /* Internal MWDS tokens — implementation detail, not public API. */\n${internal}\n\n` +
    `  /* Composite shadows assembled from MWDS shadow parts. */\n${shadows.join("\n")}\n\n` +
    `  /* Public API (tokens/mapping.mjs). */\n${pub.join("\n")}\n}\n`
  );
}

function buildThemeCss(dictionary) {
  const byPath = new Map(dictionary.allTokens.map((t) => [t.path.join("."), t]));
  const ref = (dotted) => {
    const t = byPath.get(dotted);
    if (!t) throw new Error(`tokens/mapping.mjs references missing token "${dotted}"`);
    return `var(--${t.name})`;
  };
  const lines = [
    "  /* Colors — public semantic API only. */",
    ...M.PUBLIC_COLORS.map(([n]) => `  --color-${n}: var(--${n});`),
    "",
    "  /* Radius scale (MWDS border radii). */",
    ...M.TAILWIND_RADIUS.map(([n, p]) => `  --radius-${n}: ${ref(p)};`),
    "",
    "  /* Numeric spacing multiplier = MWDS absolute base unit (p-4 = 16px). */",
    `  --spacing: ${ref(M.TAILWIND_SPACING_BASE)};`,
    "",
    "  /* Font families (next/font self-hosted Geist; MWDS names asserted in tests). */",
    ...M.FONT_FAMILIES.map(([n, , css]) => `  --font-${n}: ${css}, ui-${n === "mono" ? "monospace" : "sans-serif"}, system-ui;`),
    "",
    "  /* Weights. */",
    ...M.TAILWIND_FONT_WEIGHT.map(([n, p]) => `  --font-weight-${n}: ${ref(p)};`),
    "",
    "  /* Type styles (MWDS paragraph/caption/heading). */",
    ...M.TAILWIND_TEXT.flatMap(([n, size, lh, ls, w]) => [
      `  --text-${n}: ${ref(size)};`,
      `  --text-${n}--line-height: ${ref(lh)};`,
      `  --text-${n}--letter-spacing: ${ref(ls)};`,
      ...(w ? [`  --text-${n}--font-weight: ${ref(w)};`] : []),
    ]),
    "",
    "  /* Shadows. */",
    ...M.TAILWIND_SHADOWS.map((l) => `  --shadow-${l}: var(--mwd-shadow-${l});`),
  ];
  return (
    HEADER("Tailwind v4 bridge. Import AFTER mwds-tokens.css. Re-exports only; defines no values.") +
    `\n@theme inline {\n${lines.join("\n")}\n}\n`
  );
}

export async function build() {
  const sd = new StyleDictionary({
    source: sourceFiles().map((f) => resolve(root, f)),
    usesDtcg: true,
    log: { verbosity: "silent", warnings: "error" },
    hooks: {
      formats: {
        "mwds/tokens-css": ({ dictionary }) => buildTokensCss(dictionary),
        "mwds/tailwind-theme": ({ dictionary }) => buildThemeCss(dictionary),
      },
    },
    platforms: {
      css: {
        transforms: ["mwds/name", "mwds/dimension", "mwds/color/alias-opacity", "mwds/font-family"],
        files: [
          { destination: TOKENS_FILE, format: "mwds/tokens-css" },
          { destination: THEME_FILE, format: "mwds/tailwind-theme" },
        ],
      },
    },
  });
  const outputs = await sd.formatPlatform("css");
  return Object.fromEntries(outputs.map((o) => [o.destination, o.output]));
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const check = process.argv.includes("--check");
  const files = await build();
  let drift = false;
  for (const [dest, css] of Object.entries(files)) {
    const abs = resolve(root, dest);
    if (check) {
      let current = "";
      try { current = readFileSync(abs, "utf8"); } catch {}
      if (current !== css) {
        drift = true;
        console.error(`✗ ${dest} is out of date with tokens/mwds — run npm run tokens:build`);
      } else console.log(`✓ ${dest}`);
    } else {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, css);
      console.log(`✓ wrote ${dest}`);
    }
  }
  if (drift) process.exit(1);
}
