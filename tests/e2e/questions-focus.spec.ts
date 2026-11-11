import { expect, test, type Page } from "@playwright/test";
import { OFFICIAL_RUNS_ON_HOLD } from "../../src/lib/permit-hold";

/**
 * Focus must never be left on <body> when the Questions form swaps its content (QuestionsPanel). Sending replaces
 * the form with the success message, and "Ask another question" swaps it back; either removes the focused button.
 * Escape is handled by the panel, so while focus sat on <body> (a passive effect moved it a moment later) Escape
 * did nothing, which made home.spec.ts "the Questions panel validates, sends through Formspree..." fail
 * intermittently on slow CI runners (2026-11-10 and 2026-11-11).
 *
 * These checks read `document.activeElement` at the instant the new content is inserted into the DOM, from a
 * MutationObserver, so they do not depend on timing: before the fix focus was <body> every time. Formspree is
 * mocked; the live form is never contacted. Viewport does not matter, so only the desktop project runs them.
 */
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };

test.beforeEach(async ({ page }) => {
  test.skip(test.info().project.name !== "desktop", "viewport-independent");
  await page.route("https://formspree.io/**", async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
  });
});

/** Records `document.activeElement` the first time an element matching `selector` is inserted. */
async function watchFocusWhenInserted(page: Page, selector: string, key: string) {
  await page.evaluate(
    ({ selector, key }) => {
      const w = window as unknown as Record<string, string | null>;
      w[key] = null;
      const seen = new Set<Element>(document.querySelectorAll(selector));
      new MutationObserver(() => {
        if (w[key] !== null) return;
        const fresh = [...document.querySelectorAll(selector)].find((e) => !seen.has(e));
        if (!fresh) return;
        w[key] = document.activeElement === fresh ? "the new content" : (document.activeElement?.tagName ?? "none");
      }).observe(document.body, { childList: true, subtree: true });
    },
    { selector, key },
  );
}
const recorded = (page: Page, key: string) => page.evaluate((k) => (window as unknown as Record<string, string | null>)[k], key);

async function send(panel: ReturnType<Page["locator"]>) {
  await panel.getByLabel("Your question").fill("Is there a pace group for beginners?");
  await panel.getByLabel("Email").fill("runner@example.com");
  await panel.getByRole("button", { name: "Send question" }).click();
}

test("floating panel: focus is on the success message the moment it appears, so Escape closes it", async ({ page }) => {
  await page.goto("/");
  await watchFocusWhenInserted(page, '[role="dialog"] [role="status"]', "atStatus");
  const trigger = page.getByRole("button", { name: "Questions?" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Questions about the club?" });
  await send(dialog);
  await expect(dialog.getByRole("status")).toContainText("your question is on its way");
  expect(await recorded(page, "atStatus")).toBe("the new content");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("floating panel: 'Ask another question' puts focus straight on the question field", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Questions?" }).click();
  const dialog = page.getByRole("dialog", { name: "Questions about the club?" });
  await send(dialog);
  await expect(dialog.getByRole("status")).toBeVisible();
  await watchFocusWhenInserted(page, '[role="dialog"] textarea[name="message"]', "atForm");
  await dialog.getByRole("button", { name: "Ask another question" }).click();
  await expect(dialog.getByLabel("Your question")).toBeFocused();
  expect(await recorded(page, "atForm")).toBe("the new content");
});

test.describe("modal dialog on /calendar (while official runs are on hold)", () => {
  test.skip(!OFFICIAL_RUNS_ON_HOLD, "The dialog is only on /calendar while runs are on hold.");

  test("focus is on the success message the moment it appears, so Escape closes it and focus returns to the link", async ({ page }) => {
    await page.goto("/calendar");
    await watchFocusWhenInserted(page, "dialog [role=\"status\"]", "atStatus");
    const link = page.getByRole("button", { name: "send us your questions" });
    await link.click();
    const dialog = page.getByRole("dialog", { name: "Questions about the club?" });
    await send(dialog);
    await expect(dialog.getByRole("status")).toContainText("your question is on its way");
    expect(await recorded(page, "atStatus")).toBe("the new content");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
  });
});
