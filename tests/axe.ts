import axe from "axe-core";

/**
 * Runs axe-core against a rendered container and returns violations.
 * jsdom has no layout, so color-contrast is evaluated in the Playwright
 * browser suite (tests/e2e) instead.
 */
export async function axeViolations(container: Element) {
  const result = await axe.run(container, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}
