import { expect, test, type Locator, type Page } from "@playwright/test";
import { measureTextContrast } from "./contrast.mjs";

/**
 * Homepage browser checks at the three Figma frame widths (projects: mobile
 * 393, tablet 768, desktop 1440 — the desktop frame's 1400 container state).
 * Figma: Home / Desktop 1:10, Tablet 1:451, Mobile 1:884.
 *
 * The page is prerendered with the build-time clock and revalidated hourly, so
 * which run is "next" depends on when it was built. Assertions here don't
 * depend on run order; visual snapshots mask the time-dependent run content.
 */

const AXE_PATH = require.resolve("axe-core");

type Frame = {
  hero: { h: number; h1Size: number; h1Top: number; ctaTop: number; ctaH: number; cardTop: number; cardW: number | "full" };
  sections: Record<"community" | "jsu" | "flat" | "hills", number>;
  runRowH: number;
  hillRowH: number;
  fluid: Record<"jsu" | "flat" | "hills" | "stat", number>;
};

// Figma measurements (px). Section heights are compared ±2px.
const FIGMA: Record<string, Frame> = {
  mobile: {
    hero: { h: 614, h1Size: 48, h1Top: 52, ctaTop: 230, ctaH: 48, cardTop: 326, cardW: "full" },
    sections: { community: 390, jsu: 460, flat: 398, hills: 1196.75 },
    runRowH: 166,
    hillRowH: 100,
    fluid: { jsu: 56, flat: 70, hills: 48, stat: 48 },
  },
  tablet: {
    hero: { h: 670, h1Size: 98, h1Top: 66, ctaTop: 304, ctaH: 56, cardTop: 400, cardW: 380 },
    sections: { community: 442, jsu: 430, flat: 514, hills: 934 },
    runRowH: 124,
    hillRowH: 96,
    fluid: { jsu: 80, flat: 110, hills: 54, stat: 48 },
  },
  desktop: {
    hero: { h: 846, h1Size: 209, h1Top: 115, ctaTop: 677, ctaH: 56, cardTop: 677, cardW: 542 },
    sections: { community: 589, jsu: 626.6, flat: 709.8, hills: 1272 },
    runRowH: 113.8,
    hillRowH: 109.8,
    fluid: { jsu: 144, flat: 144, hills: 96, stat: 96 },
  },
};
const frame = (name: string) => FIGMA[name];

const box = async (l: Locator) => (await l.boundingBox())!;
const css = (l: Locator, prop: string, pseudo?: string) =>
  l.evaluate((el, [p, ps]) => getComputedStyle(el, ps ?? null).getPropertyValue(p!), [prop, pseudo] as const);

const hero = (p: Page) => p.locator("section[aria-labelledby=hero-heading]");
const runs = (p: Page) => p.locator("section[aria-labelledby=upcoming-runs-heading]");
const hills = (p: Page) => p.locator("section[aria-labelledby=hills-heading]");
const jsu = (p: Page) => p.locator("section[aria-labelledby=just-show-up-heading]");
const community = (p: Page) => p.locator("main > section").nth(1);
const flat = (p: Page) => p.locator("main > section").last();

async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}

/** Scrolls through the page so lazy images load, then returns to the top. */
async function loadAll(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    window.scrollTo(0, 0);
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("structure and content", () => {
  test("renders the seven sections in Figma order between header and footer", async ({ page }) => {
    await expect(page.locator("main > section")).toHaveCount(7);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("MAKE YOUR OWN MTNS");
    const h2s = await page.locator("main h2").allTextContents();
    // The next-run card title is an h2 inside the hero; section headings follow in order.
    expect(h2s.slice(1)).toEqual(["2026 club totals.", "See you on the hill.", "Get high in the city.", "JUST SHOW UP."]);
    await expect(community(page)).toContainText("questioning our sanity decisions.");
    await expect(flat(page)).toContainText("FLAT IS A STATE OF MIND.");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("marks every unverified figure and schedule visibly", async ({ page }) => {
    await expect(hero(page).getByText("Sample · unconfirmed")).toBeVisible();
    await expect(runs(page).getByText("Sample schedule · unconfirmed")).toBeVisible();
    await expect(page.getByText("Provisional · unverified figures")).toBeVisible();
    await expect(hills(page).getByText("Figures unverified")).toBeVisible();
    await expect(page.getByText("Example Hill")).toHaveCount(0);
  });

  test("lists three upcoming runs and five hills, each linking to its detail route", async ({ page }) => {
    const runLinks = runs(page).locator("li h3 a");
    await expect(runLinks).toHaveCount(3);
    for (const href of await runLinks.evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
      expect(href).toMatch(/^\/calendar\/(cricket-mtn-repeats|horner-hell-repeats|schiller-quad-killer)$/);
    }
    await expect(hills(page).locator("li h3 a")).toHaveCount(5);
    await expect(runs(page).locator("time").first()).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}-0[56]:00$/);
  });

  test("never requests Figma or other off-site assets", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.hostname !== "localhost") external.push(r.url());
    });
    await page.reload();
    await loadAll(page);
    expect(external).toEqual([]);
  });

  test("loads the hero photo eagerly at high priority and the rest lazily", async ({ page }) => {
    const heroImg = hero(page).locator("img");
    await expect(heroImg).toHaveAttribute("fetchpriority", "high");
    await expect(heroImg).not.toHaveAttribute("loading", "lazy");
    await expect(jsu(page).locator("img")).toHaveAttribute("loading", "lazy");
    await expect(hills(page).locator("figure img")).toHaveAttribute("loading", "lazy");
  });
});

test.describe("layout against Figma", () => {
  test("hero geometry and fluid headline", async ({ page }, info) => {
    const f = frame(info.project.name).hero;
    const heroBox = await box(hero(page));
    expect(Math.round(heroBox.height)).toBe(f.h);
    const h1 = page.getByRole("heading", { level: 1 });
    expect(parseFloat(await css(h1, "font-size"))).toBeCloseTo(f.h1Size, 0);
    expect(Math.round((await box(h1)).y - heroBox.y)).toBe(f.h1Top);

    const find = hero(page).getByRole("link", { name: "Find a Run" });
    const become = hero(page).getByRole("link", { name: "Become a Mtn Runner" });
    const findBox = await box(find);
    expect(Math.round(findBox.y - heroBox.y)).toBe(f.ctaTop);
    expect(Math.round(findBox.height)).toBe(f.ctaH);
    expect(Math.round((await box(become)).y)).toBe(Math.round(findBox.y));

    const card = hero(page).getByRole("article");
    const cardBox = await box(card);
    expect(Math.round(cardBox.y - heroBox.y)).toBe(f.cardTop);
    const container = await box(page.locator("main > section").first().locator(":scope > div").last());
    const contentRight = container.x + container.width - (info.project.name === "mobile" ? 24 : 48);
    expect(Math.round(cardBox.x + cardBox.width)).toBe(Math.round(contentRight)); // right-aligned to the container
    if (f.cardW !== "full") expect(Math.round(cardBox.width)).toBe(f.cardW);
    else expect(Math.round(cardBox.x)).toBe(24);
  });

  test("desktop card overhangs the hero, stays on top and unclipped; inside the hero elsewhere", async ({ page }, info) => {
    const heroBox = await box(hero(page));
    const card = hero(page).getByRole("article");
    const cardBox = await box(card);
    const overhang = cardBox.y + cardBox.height - (heroBox.y + heroBox.height);
    if (info.project.name === "desktop") {
      // elementFromPoint works in viewport coordinates: bring the overhang into view.
      await page.evaluate((y) => window.scrollTo(0, y - 300), heroBox.y + heroBox.height);
      const scrolled = await page.evaluate(() => window.scrollY);
      expect(overhang).toBeGreaterThan(70);
      expect(overhang).toBeLessThan(80);
      // The overhanging strip belongs to the card (stacking), not the next section.
      const y = heroBox.y + heroBox.height + overhang / 2 - scrolled;
      const hit = await page.evaluate(([x, yy]) => document.elementFromPoint(x, yy)?.closest("article")?.tagName ?? null, [cardBox.x + 40, y]);
      expect(hit).toBe("ARTICLE");
      // CTAs and card never collide.
      const become = await box(hero(page).getByRole("link", { name: "Become a Mtn Runner" }));
      expect(become.x + become.width).toBeLessThan(cardBox.x);
    } else {
      expect(overhang).toBeLessThan(0);
    }
  });

  test("section heights match the Figma frames (±2px)", async ({ page }, info) => {
    const f = frame(info.project.name).sections;
    const near = async (l: Locator, v: number) => expect(Math.abs((await box(l)).height - v)).toBeLessThanOrEqual(2);
    await near(community(page), f.community);
    await near(jsu(page), f.jsu);
    await near(flat(page), f.flat);
    // Hills: the provisional caption sits inside the figure, so height is unaffected.
    await near(hills(page), f.hills);
  });

  test("run and hill rows match Figma row heights", async ({ page }, info) => {
    const f = frame(info.project.name);
    for (const li of await runs(page).locator("li").all()) expect((await box(li)).height).toBeCloseTo(f.runRowH, 0);
    for (const li of await hills(page).locator("li").all()) expect((await box(li)).height).toBeCloseTo(f.hillRowH, 0);
  });

  test("display type hits the Figma size at each frame", async ({ page }, info) => {
    const f = frame(info.project.name).fluid;
    const size = async (l: Locator) => parseFloat(await css(l, "font-size"));
    expect(await size(jsu(page).getByRole("heading"))).toBeCloseTo(f.jsu, 0);
    expect(await size(flat(page).locator("p"))).toBeCloseTo(f.flat, 0);
    expect(await size(hills(page).getByRole("heading", { level: 2 }))).toBeCloseTo(f.hills, 0);
    expect(await size(page.locator("section[aria-labelledby=club-totals-heading] dd").first())).toBeCloseTo(f.stat, 0);
  });

  test("no horizontal overflow and no colliding hero layout at intermediate widths", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "one sweep is enough; it sets its own widths");
    for (const width of [320, 360, 480, 600, 700, 820, 900, 1023, 1024, 1100, 1180, 1280, 1366, 1600, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scroll, `scrollWidth at ${width}`).toBeLessThanOrEqual(width);
      if (width >= 1024) {
        const become = await box(hero(page).getByRole("link", { name: "Become a Mtn Runner" }));
        const card = await box(hero(page).getByRole("article"));
        expect(become.x + become.width, `CTA/card overlap at ${width}`).toBeLessThan(card.x);
      }
      // Display headings fit inside the container.
      for (const h of await page.locator("main h1, main h2").all()) {
        const b = await box(h);
        expect(b.x + b.width, `heading overflow at ${width}`).toBeLessThanOrEqual(width + 0.5);
      }
    }
  });
});

test.describe("navigation and interaction", () => {
  test("CTAs and rows go to the v1 routes", async ({ page }) => {
    await hero(page).getByRole("link", { name: "Find a Run" }).click();
    await expect(page).toHaveURL(/\/calendar$/);
    await page.goBack();

    await hero(page).getByRole("link", { name: "Become a Mtn Runner" }).click();
    await expect(page).toHaveURL(/\/join$/);
    await page.goBack();

    // Rows are clickable anywhere (stretched link), not only on the name.
    const firstRun = runs(page).locator("li").first();
    await firstRun.scrollIntoViewIfNeeded();
    const runHref = await firstRun.locator("a").getAttribute("href");
    const rowBox = await box(firstRun);
    await page.mouse.click(rowBox.x + rowBox.width - 30, rowBox.y + rowBox.height / 2);
    await expect(page).toHaveURL(new RegExp(`${runHref}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goBack();

    const trashmore = hills(page).locator("li").last();
    await trashmore.scrollIntoViewIfNeeded();
    const hb = await box(trashmore);
    await page.mouse.click(hb.x + hb.width - 60, hb.y + hb.height / 2);
    await expect(page).toHaveURL(/\/hills\/mt-trashmore$/);
    await expect(page.getByText("Not measured yet").first()).toBeVisible();
    await page.goBack();

    await hills(page).getByRole("link", { name: "Explore all hills" }).click();
    await expect(page).toHaveURL(/\/hills$/);
    await page.goBack();

    await jsu(page).getByRole("link", { name: "Join Us" }).click();
    await expect(page).toHaveURL(/\/join$/);
  });

  test("keyboard order follows reading order through the homepage", async ({ page }) => {
    const order: string[] = [];
    await page.locator("body").focus();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const label = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement | null;
        if (!a || !a.closest("main")) return null;
        return (a.textContent ?? "").trim().replace(/\s+/g, " ");
      });
      if (label) order.push(label);
    }
    const expected = [
      "Find a Run",
      "Become a Mtn Runner",
      "Run details",
      // three run names (order depends on the build clock)
      "See the full schedule",
      "Explore all hills",
      "Cricket Hill",
      "Warren Hill",
      "Horner Hill",
      "Schiller Hill",
      "Mt. Trashmore",
      "Find a Run",
      "Join Us",
    ];
    expect(order.slice(0, 3)).toEqual(expected.slice(0, 3));
    expect(order.slice(3, 6).sort()).toEqual(["Cricket Mtn Repeats", "Horner Hell Repeats", "Schiller Quad Killer"]);
    expect(order.slice(6, 15)).toEqual(expected.slice(3));
  });

  test("focus rings contrast with every surface (white on black and photos, black on white)", async ({ page }) => {
    const ringColor = (shadow: string) => [...shadow.matchAll(/(rgba?\([^)]+\)) 0px 0px 0px (\d+)px/g)].filter((m) => Number(m[2]) > 0).map((m) => [m[1], Number(m[2])]);

    // Photo (hero): white 3px ring after a 2px black gap.
    const cta = hero(page).getByRole("link", { name: "Find a Run" });
    await cta.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(cta).toBeFocused();
    expect(ringColor(await css(cta, "box-shadow"))).toEqual([["rgb(0, 0, 0)", 2], ["rgb(255, 255, 255)", 5]]);

    // Black section: run row ring is white, drawn on the row overlay.
    const runLink = runs(page).locator("li a").first();
    await runLink.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    expect(await css(runLink, "box-shadow", "::after")).toContain("rgb(255, 255, 255)");

    // White section: hill row ring is black.
    const hillLink = hills(page).locator("li a").first();
    await hillLink.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    expect(await css(hillLink, "box-shadow", "::after")).toContain("rgb(0, 0, 0)");
  });

  test("hover states exist (not drawn in Figma; reviewed choices)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "pointer hover");
    const row = hills(page).locator("li").first();
    const before = await css(row, "background-color");
    await row.hover();
    await expect.poll(() => css(row, "background-color")).not.toBe(before);
    const outline = jsu(page).getByRole("link", { name: "Join Us" });
    await outline.hover();
    await expect.poll(() => css(outline, "background-color")).toBe("rgb(255, 255, 255)");
  });

  test("reduced motion removes transitions; otherwise they are short", async ({ page, browser }) => {
    const cta = hero(page).getByRole("link", { name: "Find a Run" });
    expect(await css(cta, "transition-duration")).toBe("0.15s");

    const reduced = await browser.newPage({ reducedMotion: "reduce", viewport: page.viewportSize()! });
    await reduced.goto("/");
    for (const sel of ["[data-slot=cta-link]", "section[aria-labelledby=hills-heading] li", "a.group\\/arrow svg"]) {
      const durations = await reduced.locator(sel).evaluateAll((els) => els.map((e) => getComputedStyle(e).transitionDuration));
      expect(durations.every((d) => d === "0s"), sel).toBe(true);
    }
    await reduced.close();
  });
});

test.describe("accessibility", () => {
  test("has no axe violations (WCAG 2.2 AA, including color contrast)", async ({ page }) => {
    await loadAll(page);
    expect(await axe(page)).toEqual([]);
  });

  /**
   * Text over photography, measured worst region by worst region against the
   * composited pixels (method and limitations: tests/e2e/contrast.mjs). WCAG AA:
   * 3:1 for large text (the display headings), 4.5:1 otherwise — the CTA labels
   * are 15–18px semibold and the copy 16–18px medium, so neither counts as large.
   */
  const PHOTO_TEXT: [string, (p: Page) => Locator, number][] = [
    ["hero headline", (p) => p.locator("#hero-heading"), 3],
    ["hero Find a Run", (p) => hero(p).locator("[data-slot=cta-link]").nth(0), 4.5],
    ["hero Become a Mtn Runner", (p) => hero(p).locator("[data-slot=cta-link]").nth(1), 4.5],
    ["Just show up heading", (p) => p.locator("#just-show-up-heading"), 3],
    ["Just show up copy", (p) => p.locator("#just-show-up-heading + p"), 4.5],
    ["Just show up Find a Run", (p) => jsu(p).locator("[data-slot=cta-link]").nth(0), 4.5],
    ["Just show up Join Us", (p) => jsu(p).locator("[data-slot=cta-link]").nth(1), 4.5],
  ];

  test("text over photography meets WCAG AA in its worst region", async ({ page }, info) => {
    await loadAll(page);
    for (const [name, locate, need] of PHOTO_TEXT) {
      const r = await measureTextContrast(page, locate(page));
      info.annotations.push({ type: `contrast ${name}`, description: `worst ${r.worst} (p10 ${r.p10}, median ${r.median}) over ${r.cells} cells` });
      expect(r.cells, `${name}: measurable regions`).toBeGreaterThan(0);
      expect.soft(r.worst, `${name} worst-region contrast`).toBeGreaterThanOrEqual(need);
    }
  });

  test("photo text stays legible at intermediate widths, where the crop shifts", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "one sweep is enough; it sets its own widths");
    for (const width of [320, 600, 900, 1024, 1180, 1280, 1366, 1600, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await loadAll(page);
      for (const [name, locate, need] of PHOTO_TEXT) {
        const r = await measureTextContrast(page, locate(page));
        // Soft: report every failing width and target, not just the first.
        expect.soft(r.worst, `${name} at ${width}px`).toBeGreaterThanOrEqual(need);
      }
    }
  });
});

test.describe("visual @visual", () => {
  test("full homepage", async ({ page }, info) => {
    await loadAll(page);
    // Run order, slot labels and the next-run card depend on the build clock.
    const mask = [hero(page).getByRole("article"), runs(page).locator("ol")];
    await expect(page).toHaveScreenshot(`home-${info.project.name}.png`, { fullPage: true, mask, animations: "disabled" });
  });
});
