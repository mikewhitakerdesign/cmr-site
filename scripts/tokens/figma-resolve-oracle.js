// Alias/mode resolution oracle.
//
// Runs INSIDE Figma (Plugin API), against the CMR website file
// (https://www.figma.com/design/hLEeAchFtgd1WFtboIChil) — NOT the MWDS
// library. Read-only. Same execution options as figma-export.js.
//
// It asks Figma's own resolver what each published MWDS variable resolves to
// for a real CMR consumer node that carries the explicit CMR modes, and emits
// tokens/mwds/validation/cmr.resolved.json. tests/tokens.test.ts compares the
// Style Dictionary output against this file, so the code pipeline is checked
// against Figma's resolution, not against itself.

const CONSUMER_NODE = "1:324"; // Home / Desktop → Footer → NewsletterForm
const SHADOW_NODE = "103:52"; // MWDS / Email address instance (binds xs/* shadow)
const COLLECTIONS = ["semantic colors", "brand colors", "shadows"];

const hex = (c) => {
  const h = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b) + (c.a === undefined || c.a >= 1 ? "" : h(c.a));
};

const consumer = await figma.getNodeByIdAsync(CONSUMER_NODE);
const shadowNode = await figma.getNodeByIdAsync(SHADOW_NODE);
if (!consumer || !shadowNode) throw new Error("Consumer nodes not found — has the CMR file changed?");

// Discover the remote collections through the variables bound in this file.
const collectionIds = new Set();
const seed = async (node) => {
  for (const binding of Object.values(node.boundVariables || {})) {
    for (const alias of [].concat(binding)) {
      if (!alias || !alias.id) continue;
      const v = await figma.variables.getVariableByIdAsync(alias.id);
      if (v) collectionIds.add(v.variableCollectionId);
      // Follow one alias hop per mode to reach collections used only indirectly.
      for (const val of Object.values(v ? v.valuesByMode : {})) {
        const ref = val && val.type === "VARIABLE_ALIAS" ? val : val && val.color;
        if (ref && ref.id) {
          const t = await figma.variables.getVariableByIdAsync(ref.id);
          if (t) collectionIds.add(t.variableCollectionId);
        }
      }
    }
  }
};
for (const n of [shadowNode, ...shadowNode.findAll(() => true)]) await seed(n);
for (const n of (await figma.getNodeByIdAsync("103:62")).findAll(() => true)) await seed(n);

const explicitModes = {};
for (const [cid, mid] of Object.entries(consumer.explicitVariableModes)) {
  const c = await figma.variables.getVariableCollectionByIdAsync(cid);
  explicitModes[c.name] = c.modes.find((m) => m.modeId === mid).name;
}

const values = {};
const coverage = {};
for (const cid of collectionIds) {
  const c = await figma.variables.getVariableCollectionByIdAsync(cid);
  if (!c || !COLLECTIONS.includes(c.name)) continue;
  coverage[c.name] = { available: c.variableIds.length, resolved: 0 };
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    if (!v || v.resolvedType !== "COLOR") continue;
    const node = c.name === "shadows" ? shadowNode : consumer;
    values[`${c.name}/${v.name}`] = hex(v.resolveForConsumer(node).value);
    coverage[c.name].resolved++;
  }
}

return {
  capturedAt: new Date().toISOString(),
  source: { figmaFileKey: figma.fileKey, consumerNode: CONSUMER_NODE, shadowNode: SHADOW_NODE },
  explicitModes,
  coverage,
  values: Object.fromEntries(Object.entries(values).sort(([a], [b]) => a.localeCompare(b))),
};
