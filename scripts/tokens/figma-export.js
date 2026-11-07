// MWDS → DTCG token exporter.
//
// Runs INSIDE Figma (Plugin API), against the MWDS library file
// (https://www.figma.com/design/H08HgMeVx6V23wY7aZdENf). Two supported ways:
//   1. Figma MCP `use_figma` — paste this file as `code` (fileKey H08HgMeVx6V23wY7aZdENf).
//   2. Figma desktop → Plugins → Development → Open console, wrapped in an async IIFE.
// It is read-only: it never creates, edits, or deletes anything in Figma.
//
// Why a Plugin API script and not the REST API: Figma's Variables REST API is
// Enterprise-only (see ../../README and mwd-x-shadcn/retrieval/README.md).
//
// Output: { manifest, files } where `files` maps a repo path
// (tokens/mwds/<collection>/<mode>.tokens.json) to a DTCG token tree. The
// result is written verbatim to the repo; it is never hand-edited.
// `use_figma` caps responses at ~48 KB, so set CONFIG.only to page the output
// (see tokens/README.md → "Re-exporting from Figma").

const CONFIG = {
  // Collections whose modes are selected explicitly. Every other exported
  // collection is single-mode and exports that mode.
  modes: { "semantic colors": ["cmr"], "brand colors": ["cmr"] },
  // Theme = the explicit mode pairing a consuming frame must set. Verified in
  // the CMR file: NewsletterForm (node 1:324) sets BOTH of these explicitly.
  themes: { cmr: { "semantic colors": "cmr", "brand colors": "cmr" } },
  // Not exported, with the reason recorded in the manifest.
  exclude: {
    "---": "Empty separator collection.",
    "chart colors": "No `cmr` mode exists yet; no CMR chart surfaces are in scope.",
  },
  // Primitive collections exported only for variables reachable through the
  // alias graph of the exported tokens (plus the prefixes below).
  closureOnly: ["raw colors", "alpha"],
  alwaysInclude: { "raw colors": ["cmr/"] },
  // Paging: null = all files; otherwise an array of collection names.
  only: null,
};

const EXPORTER_VERSION = "1.0.0";

const round = (n) => Math.round(n * 1e4) / 1e4;
const hex = (c) => {
  const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  const a = c.a === undefined || c.a >= 1 ? "" : h(c.a);
  return "#" + h(c.r) + h(c.g) + h(c.b) + a;
};
const slug = (s) =>
  s.toLowerCase().replace(/[()]/g, "").trim().replace(/[^a-z0-9]+/g, "-");
const fnv1a = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};
const WEIGHTS = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, Semibold: 600, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };
const DIMENSION_SCOPES = ["CORNER_RADIUS", "WIDTH_HEIGHT", "GAP", "EFFECT_FLOAT", "FONT_SIZE", "LINE_HEIGHT", "LETTER_SPACING", "PARAGRAPH_SPACING"];

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const varById = new Map(variables.map((v) => [v.id, v]));
const colById = new Map(collections.map((c) => [c.id, c]));

const exportedModeIds = (c) => {
  const wanted = CONFIG.modes[c.name];
  if (!wanted) {
    if (c.modes.length !== 1) throw new Error(`"${c.name}" has ${c.modes.length} modes; list the modes to export in CONFIG.modes.`);
    return [c.modes[0].modeId];
  }
  return wanted.map((name) => {
    const m = c.modes.find((x) => x.name === name);
    if (!m) throw new Error(`Mode "${name}" not found in "${c.name}".`);
    return m.modeId;
  });
};

const isAlias = (v) => v && typeof v === "object" && v.type === "VARIABLE_ALIAS";
// The `alpha` collection stores { color: <alias>, opacity: <0–100> }.
const isAliasWithOpacity = (v) => v && typeof v === "object" && isAlias(v.color) && typeof v.opacity === "number";

// ---- Reachability closure over the alias graph -------------------------
const included = new Set();
const visit = (variable, modeId) => {
  const key = variable.id;
  const col = colById.get(variable.variableCollectionId);
  const isClosure = CONFIG.closureOnly.includes(col.name);
  if (isClosure && included.has(key)) return;
  if (isClosure) included.add(key);
  // A referenced variable in another collection resolves in that collection's
  // own exported mode(s), so follow every exported mode of the target.
  const val = variable.valuesByMode[modeId];
  const ref = isAlias(val) ? val : isAliasWithOpacity(val) ? val.color : null;
  if (!ref) return;
  const target = varById.get(ref.id);
  if (!target) throw new Error(`Alias in "${variable.name}" points to a non-local variable (${ref.id}).`);
  const tcol = colById.get(target.variableCollectionId);
  if (CONFIG.exclude[tcol.name]) throw new Error(`"${variable.name}" aliases excluded collection "${tcol.name}".`);
  for (const m of exportedModeIds(tcol)) visit(target, m);
};
for (const c of collections) {
  if (CONFIG.exclude[c.name] || CONFIG.closureOnly.includes(c.name)) continue;
  for (const id of c.variableIds) for (const m of exportedModeIds(c)) visit(varById.get(id), m);
}
for (const [colName, prefixes] of Object.entries(CONFIG.alwaysInclude)) {
  const c = collections.find((x) => x.name === colName);
  for (const id of c.variableIds) {
    const v = varById.get(id);
    if (prefixes.some((p) => v.name.startsWith(p))) for (const m of exportedModeIds(c)) visit(v, m);
  }
}

// ---- DTCG emission ------------------------------------------------------
const refOf = (variable) => {
  const col = colById.get(variable.variableCollectionId);
  return "{" + [col.name, ...variable.name.split("/")].join(".") + "}";
};
const typeOf = (v) => {
  if (v.resolvedType === "COLOR") return "color";
  if (v.resolvedType === "FLOAT") return v.scopes.some((s) => DIMENSION_SCOPES.includes(s)) ? "dimension" : "number";
  if (v.resolvedType === "STRING") {
    if (v.scopes.includes("FONT_FAMILY")) return "fontFamily";
    if (v.scopes.includes("FONT_STYLE")) return "fontWeight";
    return "string";
  }
  throw new Error(`Unsupported variable type ${v.resolvedType} on "${v.name}".`);
};
const valueOf = (v, raw, $type) => {
  if (isAlias(raw)) return { $value: refOf(varById.get(raw.id)) };
  if (isAliasWithOpacity(raw)) return { $value: refOf(varById.get(raw.color.id)), opacity: round(raw.opacity) };
  if ($type === "color") return { $value: hex(raw) };
  if ($type === "dimension") return { $value: { value: round(raw), unit: "px" } };
  if ($type === "number") return { $value: round(raw) };
  if ($type === "fontWeight") {
    if (!(raw in WEIGHTS)) throw new Error(`Unknown font style "${raw}" on "${v.name}".`);
    return { $value: WEIGHTS[raw], figmaValue: raw };
  }
  return { $value: raw };
};

const setPath = (tree, segments, token, name) => {
  let node = tree;
  for (const seg of segments.slice(0, -1)) {
    if (seg.includes(".") || seg.includes("{") || seg.includes("}")) throw new Error(`Illegal character in "${name}".`);
    node[seg] = node[seg] || {};
    if ("$value" in node[seg]) throw new Error(`"${name}" collides with a token at "${seg}".`);
    node = node[seg];
  }
  const leaf = segments[segments.length - 1];
  if (node[leaf]) throw new Error(`Duplicate or group/token collision at "${name}".`);
  node[leaf] = token;
};

const files = {};
const manifestCollections = [];
for (const c of collections) {
  if (CONFIG.exclude[c.name]) continue;
  const closure = CONFIG.closureOnly.includes(c.name);
  const modeIds = exportedModeIds(c);
  const entry = {
    name: c.name,
    key: c.key,
    id: c.id,
    defaultMode: c.modes.find((m) => m.modeId === c.defaultModeId).name,
    sourceModes: c.modes.map((m) => ({ name: m.name, id: m.modeId })),
    exportedModes: [],
    variableCount: c.variableIds.length,
    exportedCount: 0,
    selection: closure ? "alias-closure" : "all",
  };
  for (const modeId of modeIds) {
    const modeName = c.modes.find((m) => m.modeId === modeId).name;
    const path = `tokens/mwds/${slug(c.name)}/${slug(modeName)}.tokens.json`;
    const tree = { [c.name]: {} };
    let count = 0;
    for (const id of c.variableIds) {
      const v = varById.get(id);
      if (closure && !included.has(v.id)) continue;
      const $type = typeOf(v);
      const { $value, opacity, figmaValue } = valueOf(v, v.valuesByMode[modeId], $type);
      const token = { $type, $value };
      if (v.description) token.$description = v.description;
      const ext = {};
      if (v.scopes.join() !== "ALL_SCOPES") ext.scopes = v.scopes;
      if (opacity !== undefined) ext.aliasOpacity = opacity;
      if (figmaValue !== undefined) ext.value = figmaValue;
      if (v.hiddenFromPublishing) ext.hiddenFromPublishing = true;
      if (Object.keys(ext).length) token.$extensions = { "com.figma": ext };
      setPath(tree[c.name], v.name.split("/"), token, v.name);
      count++;
    }
    entry.exportedModes.push({ name: modeName, id: modeId, file: path });
    entry.exportedCount = count;
    if (!CONFIG.only || CONFIG.only.includes(c.name)) files[path] = tree;
  }
  manifestCollections.push(entry);
}

const checksums = {};
for (const [path, tree] of Object.entries(files)) checksums[path] = fnv1a(JSON.stringify(tree));

const manifest = {
  source: {
    system: "MWD x Shadcn DS (MWDS)",
    figmaFileKey: figma.fileKey,
    figmaFileName: figma.root.name,
    exportedAt: new Date().toISOString(),
    exporter: `scripts/tokens/figma-export.js@${EXPORTER_VERSION}`,
  },
  themes: CONFIG.themes,
  themeEvidence: "CMR file hLEeAchFtgd1WFtboIChil, node 1:324 (NewsletterForm) sets semantic colors=cmr and brand colors=cmr explicitly.",
  excluded: Object.entries(CONFIG.exclude).map(([collection, reason]) => ({ collection, reason })),
  collections: manifestCollections,
  checksums,
};

return { manifest, files };
