import { expect, test } from "@playwright/test";

/** Visual and brand consistency pass: About circles and card, heading roles, nav labels and tooltips, body-text color. */

const noHScroll = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe("About", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("four equal circles with the approved copy; overlap 25% of the diameter (all four from lg, the bottom two below)", async ({ page }, info) => {
    const items = page.locator("section[aria-labelledby=about-heading] ul > li");
    await expect(items.locator("> div")).toHaveText([
      "Show up, run the hill, repeat.",
      "Totally Free. No Fees.",
      "Any pace, everybody welcome.",
      "First-timers to ultra-marathoners.",
    ]);
    const founderTop = (await page.locator("section[aria-labelledby=founder-heading]").boundingBox())!.y;
    const boxes = await items.locator("> div").evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height };
      }),
    );
    for (const b of boxes) expect(Math.abs(b.w - boxes[0].w)).toBeLessThan(1.5);
    const d = boxes[0].w;
    const overlap = (b: { y: number; h: number }) => b.y + b.h - founderTop;
    // The float animation moves the circles by up to 5px.
    const tol = 8;
    const row = info.project.name === "desktop";
    boxes.forEach((b, i) => {
      if (row || i >= 2) expect(Math.abs(overlap(b) - d / 4), `circle ${i}`).toBeLessThan(tol);
      else expect(overlap(b), `circle ${i}`).toBeLessThan(0);
    });
    if (row) expect(new Set(boxes.map((b) => Math.round(b.y / 10))).size).toBe(1);
    else expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(tol);
    expect(await noHScroll(page)).toBe(true);
  });

  test("hero paragraph uses the body-text color; the card is 50/50 (stacked on phones) with a caption outside it", async ({ page }, info) => {
    const p = page.locator("#about-heading ~ p");
    const color = await p.evaluate((e) => getComputedStyle(e).color);
    await page.goto("/calendar"); // the Find a Run hero support text is the reference
    expect(await page.locator("section[aria-labelledby=find-heading] h1 ~ p").evaluate((e) => getComputedStyle(e).color)).toBe(color);
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 2, name: "Hills on hills on hills." })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Members$|Get high in the city/ })).toHaveCount(0);
    const card = page.locator("[data-slot=hills-card]");
    const [photo, panel] = await card.locator("> div").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
    if (info.project.name === "mobile") {
      expect(panel.y).toBeGreaterThanOrEqual(photo.y + photo.height - 1);
    } else {
      expect(Math.abs(photo.width - panel.width)).toBeLessThan(1.5);
    }
    await expect(card.getByRole("link", { name: "Explore the hills" })).toHaveAttribute("href", "/hills");
    const cap = page.getByText("Hardik and Michael carving a path on Cricket Hill");
    expect(await cap.evaluate((e, c) => !c!.contains(e), await card.elementHandle())).toBe(true);
  });
});

test("heading roles: display sizes at 1440, one H1 per page", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop");
  const sizes: [string, string][] = [["/", "209px"], ["/hills", "128px"], ["/calendar", "128px"], ["/join", "128px"], ["/hills/cricket-hill", "128px"], ["/about", "100px"], ["/the-science", "100px"]];
  for (const [path, size] of sizes) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator("h1").evaluate((e) => getComputedStyle(e).fontSize), path).toBe(size);
  }
});

test("nav tooltips show on hover and focus for the two renamed links only (md and up)", async ({ page }, info) => {
  test.skip(info.project.name === "mobile");
  await page.goto("/about");
  const nav = page.getByRole("navigation", { name: "Primary" });
  const repeat = nav.getByRole("link", { name: "Hills on Repeat" });
  const hills = nav.getByRole("link", { name: "Hills on Hills" });
  const tip = (t: string) => page.getByRole("tooltip").filter({ hasText: t });
  await repeat.focus();
  await expect(tip("Find your next group run with Chicago Mountain Runners.")).toBeVisible();
  await page.mouse.move(0, 0);
  await hills.hover();
  const t = tip("Explore Chicago area hills and places to train.");
  await expect(t).toBeVisible();
  const b = (await t.boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await expect(nav.getByRole("link", { name: "The Science" })).not.toHaveAttribute("aria-describedby");
});

test("The Science opens at the top from a scrolled page, and section links still jump", async ({ page }) => {
  await page.goto("/about");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator("footer").getByRole("link", { name: "The Science" }).click();
  await expect(page).toHaveURL(/\/the-science$/);
  // No glide through the page: the first frames after arrival are already at the top.
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("#science-heading")).toBeInViewport();
  await page.getByRole("navigation", { name: "On this page" }).getByRole("link").nth(1).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
});

test("/hills heading holds two lines on large screens; /calendar drops the two closing sections", async ({ page }, info) => {
  await page.goto("/hills");
  const lines = await page.locator("h1 > span").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  if (info.project.name === "desktop") expect(new Set(lines).size).toBe(2);
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { name: /Know your mountain|Stay for the people/ })).toHaveCount(0);
  expect(await noHScroll(page)).toBe(true);
});

test("About: circles have no shadow; the card keeps its own; hero paragraph is 18/27 regular", async ({ page }) => {
  await page.goto("/about");
  const shadows = await page.locator("section[aria-labelledby=about-heading] ul > li > div").evaluateAll((els) => els.map((e) => getComputedStyle(e).boxShadow));
  expect(shadows).toEqual(["none", "none", "none", "none"]);
  expect(await page.locator("[data-slot=hills-card]").evaluate((e) => getComputedStyle(e).boxShadow)).not.toBe("none");
  const p = page.locator("#about-heading ~ p");
  expect(await p.evaluate((e) => { const s = getComputedStyle(e); return [s.fontWeight, s.fontSize, s.lineHeight].join(" "); })).toBe("400 18px 27px");
});

test("shared hero top spacing on the standardized pages; /calendar keeps its own", async ({ page }, info) => {
  const top = ({ mobile: 56, tablet: 72, desktop: 96 } as Record<string, number>)[info.project.name];
  const pages: [string, string][] = [
    ["/", "#hero-heading"],
    ["/hills", "#hills-heading"],
    ["/about", "#about-heading"],
    ["/the-science", "#science-heading"],
    ["/join", "#join-heading"],
    ["/terms", "#legal-title"],
    ["/privacy", "#legal-title"],
    ["/participation-guidelines", "#legal-title"],
    ["/participant-waiver", "#legal-title"],
    ["/calendar/cricket-mtn-repeats", "#run-heading"],
  ];
  for (const [path, h] of pages) {
    await page.goto(path);
    const pt = await page.locator(h).evaluate((e) => parseFloat(getComputedStyle((e.id === "hills-heading" || e.id === "about-heading" ? e.closest("section") : e.closest("div.mx-auto"))!).paddingTop));
    expect(Math.abs(pt - top), `${path} top padding ${pt}`).toBeLessThan(0.6);
  }
  await page.goto("/calendar");
  const pt = await page.locator("section[aria-labelledby=find-heading]").evaluate((e) => parseFloat(getComputedStyle(e).paddingTop));
  expect(pt).toBe(info.project.name === "mobile" ? 48 : 64);
});

test("Join: capitalization; the waiver page loads with its version and draft note", async ({ page }) => {
  await page.goto("/join");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Join the club.");
  await expect(page.getByRole("button", { name: "Count me in" })).toHaveText("Count me in");
  expect(await page.getByRole("button", { name: "Count me in" }).evaluate((e) => getComputedStyle(e).textTransform)).toBe("none");
  await page.goto("/participant-waiver");
  await expect(page).toHaveTitle("Participant Waiver and Assumption of Risk | Chicago Mountain Runners");
  await expect(page.getByText("Version CMR-WAIVER-001")).toBeVisible();
  await expect(page.getByText(/Draft for review/)).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(12);
  await expect(page.locator("footer").getByRole("link", { name: "Participant Waiver" })).toHaveAttribute("href", "/participant-waiver");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
