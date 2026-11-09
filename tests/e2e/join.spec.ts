import { expect, test, type Page } from "@playwright/test";
import { OFFICIAL_RUNS_ON_HOLD } from "../../src/lib/permit-hold";

/**
 * The Join page (/join) at 393 / 768 / 1440. Formspree is always intercepted:
 * aborted by default, mocked per test. The live Join form is never contacted.
 */
const AXE_PATH = require.resolve("axe-core");
async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}
const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
const JOIN_URL = "https://formspree.io/f/xrppvnln";

const form = (page: Page) => page.locator("#join");

async function fill(page: Page) {
  await form(page).getByLabel("First name").fill("Sam");
  await form(page).getByLabel("Email address").fill("sam@example.com");
  await form(page).getByRole("checkbox", { name: "I confirm that I'm at least 18 years old." }).check();
}

test.beforeEach(async ({ page }) => {
  await page.route("https://formspree.io/**", (r) => r.abort());
  await page.goto("/join");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("content and layout", () => {
  test("hero uses the approved copy, then the basics, then the form", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("JOIN THE CLUB.");
    await expect(page.getByText("No dues. No minimum pace. No actual mountains.", { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "Chicago Mountain Runners is a free, informal running community for people who enjoy hills, running, and the company of other people who enjoy hills and running. Join to receive club updates and announcements. Come to a run whenever it works for you. No attendance requirements. No minimum pace. No mountains required.",
        { exact: true },
      ),
    ).toBeVisible();
    const h2s = await page.locator("main h2").allTextContents();
    expect(h2s.map((h) => h.trim())).toEqual(["Membership essentials", "COUNT ME IN."]);
    await expect(page.getByText("A couple of details, and you're officially unofficial.")).toBeVisible();
  });

  test("hero uses the homepage layering: the topographic WebGL field under the mesh-gradient wash, no tie-dye", async ({ page }) => {
    const hero = page.locator("section[aria-labelledby=join-heading]");
    await expect(hero.locator("[data-slot=contour-field]")).toHaveCount(1);
    await expect(hero.locator("[data-slot=mesh-gradient]")).toHaveCount(1);
    expect(await hero.locator("[data-slot=mesh-gradient]").evaluate((e) => getComputedStyle(e).opacity)).toBe("0.2");
    await expect(hero.locator("[class*=tie-dye]")).toHaveCount(0);
  });

  test("states the membership terms without claiming permits, insurance or affiliation", async ({ page }) => {
    const main = page.locator("main");
    await expect(main).toContainText("No membership fees, minimum mileage, or attendance requirements.");
    await expect(main).toContainText("All club membership and organized runs are for adults 18 and older.");
    await expect(main).toContainText("Unsubscribe whenever you choose.");
    await expect(main).toContainText(OFFICIAL_RUNS_ON_HOLD ? "Official CMR meetups are on hold while we review park-use requirements." : "You don't have to join before attending an organized run.");
    await expect(main).not.toContainText(/permit(ted)?|insured|insurance|park district|affiliat|waiver/i);
  });

  test("fits every width without sideways scroll, and the form is usable", async ({ page }) => {
    expect(await noHScroll(page)).toBe(true);
    const box = (await form(page).getByLabel("Email address").boundingBox())!;
    const vp = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test("passes axe (including contrast) idle", async ({ page }) => {
    expect(await axe(page)).toEqual([]);
  });
});

test.describe("form behavior", () => {
  test("validates in place, focuses the first problem and sends nothing", async ({ page }) => {
    const posted: string[] = [];
    await page.unroute("https://formspree.io/**");
    await page.route("https://formspree.io/**", (r) => (posted.push(r.request().url()), r.abort()));
    await form(page).getByRole("button", { name: "Join the club" }).click();
    await expect(form(page).getByLabel("First name")).toBeFocused();
    await expect(form(page).getByLabel("First name")).toHaveAttribute("aria-invalid", "true");
    await expect(form(page).getByText("Confirm that you're 18 or older to join.")).toBeVisible();
    expect(await axe(page)).toEqual([]);
    expect(posted).toEqual([]);
  });

  test("the age box starts unchecked and is reachable and operable by keyboard", async ({ page }) => {
    const box = form(page).getByRole("checkbox", { name: "I confirm that I'm at least 18 years old." });
    await expect(box).not.toBeChecked();
    await form(page).getByLabel("Email address").focus();
    await page.keyboard.press("Tab");
    await expect(box).toBeFocused();
    await page.keyboard.press("Space");
    await expect(box).toBeChecked();
  });

  test("sends once to the Join form, then replaces the form with the confirmation, focused", async ({ page }) => {
    const posted: string[] = [];
    await page.unroute("https://formspree.io/**");
    await page.route("https://formspree.io/**", async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      posted.push(route.request().url());
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
    });
    await fill(page);
    const submit = form(page).getByRole("button", { name: "Join the club" });
    await submit.dblclick();
    await expect(form(page).getByRole("button", { name: "Joining…" })).toBeDisabled();
    const done = form(page).getByRole("status");
    await expect(done).toContainText("YOU'RE IN.");
    await expect(done).toContainText("We've received your signup. You'll hear from us when there's something worth sharing.");
    await expect(done).toContainText("In the meantime, there's a hill with your name on it.");
    await expect(done).toBeFocused();
    await expect(done.getByRole("link", { name: OFFICIAL_RUNS_ON_HOLD ? "Explore the hills" : "Find a Run" })).toHaveAttribute("href", OFFICIAL_RUNS_ON_HOLD ? "/hills" : "/calendar");
    expect(posted).toEqual([JOIN_URL]);
    expect(await axe(page)).toEqual([]);
    expect(await noHScroll(page)).toBe(true);
  });

  test("a failed delivery is reported, keeps the entries and is never confirmed", async ({ page }) => {
    await page.unroute("https://formspree.io/**");
    await page.route("https://formspree.io/**", (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: CORS })
        : route.fulfill({ status: 500, headers: CORS, contentType: "application/json", body: JSON.stringify({ errors: [{ message: "Server error." }] }) }),
    );
    await fill(page);
    await form(page).getByRole("button", { name: "Join the club" }).click();
    await expect(form(page).getByRole("alert")).toContainText("We couldn't confirm your signup. Please try again. Your information is still here.");
    await expect(page.getByText("YOU'RE IN.")).toHaveCount(0);
    await expect(form(page).getByLabel("First name")).toHaveValue("Sam");
    await expect(form(page).getByLabel("Email address")).toHaveValue("sam@example.com");
    await expect(form(page).getByRole("checkbox", { name: "I confirm that I'm at least 18 years old." })).toBeChecked();
    await expect(form(page).getByRole("button", { name: "Join the club" })).toBeEnabled();
    expect(await axe(page)).toEqual([]);
  });

  test("a blocked network is treated as a failure, not a success", async ({ page }) => {
    await fill(page); // Formspree is aborted by beforeEach
    await form(page).getByRole("button", { name: "Join the club" }).click();
    await expect(form(page).getByRole("alert")).toBeVisible();
    await expect(page.getByText("YOU'RE IN.")).toHaveCount(0);
  });
});

test.describe("navigation", () => {
  test("the Privacy Policy link goes to /privacy", async ({ page }) => {
    await form(page).getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy Policy");
  });

  test("the Questions panel and the Join form post to different Formspree forms", async ({ page }) => {
    const posted: string[] = [];
    await page.unroute("https://formspree.io/**");
    await page.route("https://formspree.io/**", async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      posted.push(route.request().url());
      await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
    });
    await fill(page);
    await form(page).getByRole("button", { name: "Join the club" }).click();
    await expect(form(page).getByRole("status")).toBeVisible();
    await page.getByRole("button", { name: "Questions?" }).click();
    const dialog = page.getByRole("dialog", { name: "Questions about the club?" });
    await dialog.getByLabel("Your question").fill("Hello?");
    await dialog.getByLabel("Email").fill("runner@example.com");
    await dialog.getByRole("button", { name: "Send question" }).click();
    await expect(dialog.getByRole("status")).toBeVisible();
    expect(posted).toEqual([JOIN_URL, "https://formspree.io/f/mwlljgld"]);
  });
});

test.describe("legal pages and FAQ", () => {
  for (const [path, title, section] of [
    ["/privacy", "Privacy Policy", "1. Information you provide"],
    ["/terms", "Terms of Use", "1. Using this website"],
    ["/participation-guidelines", "Participation Guidelines", "1. Who can participate"],
  ] as const) {
    test(`${path} is published, readable and linked from the footer`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
      await expect(page.locator("[data-slot=legal-in-review]")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(/PUBLICATION BLOCKER|VERIFY|LEGAL REVIEW/);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator("footer").getByRole("link", { name: path === "/privacy" ? "Privacy" : path === "/terms" ? "Terms" : "Participation Guidelines" })).toHaveAttribute("href", path);
      expect(await axe(page)).toEqual([]);
      expect(await noHScroll(page)).toBe(true);
    });
  }

  test("/faq has four categories, disclosures that open by keyboard, and no axe violations", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("FREQUENTLY ASKED.");
    await expect(page.locator("main h2")).toHaveCount(4);
    await expect(page.locator("main details")).toHaveCount(23);
    const first = page.locator("details").first();
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
    await expect(first.getByText("A free, informal running community")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(first).not.toHaveAttribute("open", "");
    await page.getByRole("navigation", { name: "FAQ categories" }).getByRole("link", { name: "Schedules & Safety" }).click();
    await expect(page).toHaveURL(/#schedules-and-safety$/);
    // Held: the schedule answer says meetups are on hold; nothing points at a run page.
    const where = page.locator("details", { hasText: "Where and when does CMR meet?" });
    await where.locator("summary").click();
    await expect(where).toContainText(OFFICIAL_RUNS_ON_HOLD ? "official meetups are on hold while we review park-use requirements" : "The Running Calendar is the official source");
    expect(await axe(page)).toEqual([]);
    expect(await noHScroll(page)).toBe(true);
  });

  test("the unsubscribe answer describes the manual process", async ({ page }) => {
    await page.goto("/faq");
    const d = page.locator("details", { hasText: "Can I stop receiving emails?" });
    await d.locator("summary").click();
    await expect(d).toContainText("Use the Questions form");
    await expect(d).toContainText("no one-click unsubscribe link");
  });
});
