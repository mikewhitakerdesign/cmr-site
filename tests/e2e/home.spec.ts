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
  sections: Record<"community" | "jsu" | "flat", number>;
  /** Figma run-row height; Round 2 rows add a description, so this is now a minimum. */
  runRowH: number;
  hillRowH: number;
  /** stat: Round 2 figure size (Figma 48/48/96, reduced slightly by Owner direction). */
  fluid: Record<"jsu" | "flat" | "hills" | "stat", number>;
};

// Figma measurements (px). Section heights are compared ±2px.
const FIGMA: Record<string, Frame> = {
  mobile: {
    hero: { h: 614, h1Size: 48, h1Top: 52, ctaTop: 230, ctaH: 48, cardTop: 326, cardW: "full" },
    sections: { community: 390, jsu: 460, flat: 398 },
    runRowH: 166,
    hillRowH: 100,
    fluid: { jsu: 56, flat: 70, hills: 48, stat: 40 },
  },
  tablet: {
    hero: { h: 670, h1Size: 98, h1Top: 66, ctaTop: 304, ctaH: 56, cardTop: 400, cardW: 380 },
    sections: { community: 442, jsu: 430, flat: 514 },
    runRowH: 124,
    hillRowH: 96,
    fluid: { jsu: 80, flat: 110, hills: 54, stat: 40 },
  },
  desktop: {
    hero: { h: 846, h1Size: 209, h1Top: 115, ctaTop: 677, ctaH: 56, cardTop: 677, cardW: 542 },
    sections: { community: 589, jsu: 626.6, flat: 709.8 },
    runRowH: 113.8,
    hillRowH: 109.8,
    fluid: { jsu: 144, flat: 144, hills: 96, stat: 80 },
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
  // Never reach the live Formspree form from tests (Owner instruction). Tests that
  // exercise the Questions panel install their own mocked response.
  await page.route("https://formspree.io/**", (r) => r.abort());
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

  test("shows no sample badges (Round 2) but keeps content status in the markup", async ({ page }) => {
    await expect(page.locator("main [data-provisional]")).toHaveCount(0);
    await expect(page.locator("main").getByText(/Sample|unconfirmed|unverified/)).toHaveCount(0);
    await expect(hero(page).getByRole("article")).toHaveAttribute("data-status", "provisional");
    await expect(page.locator("section[aria-labelledby=club-totals-heading]")).toHaveAttribute("data-status", "provisional");
    for (const li of await runs(page).locator("li").all()) await expect(li).toHaveAttribute("data-status", "provisional");
    await expect(page.getByText("Example Hill")).toHaveCount(0);
  });

  test("lists the two-run schedule and five hills, each linking to its detail route", async ({ page }) => {
    const runLinks = runs(page).locator("li h3 a");
    await expect(runLinks).toHaveCount(2);
    const hrefs = await runLinks.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect([...hrefs].sort()).toEqual(["/calendar/cricket-mtn-repeats", "/calendar/horner-hell-repeats"]);
    await expect(runs(page).getByText("Schiller Quad Killer")).toHaveCount(0);
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
    const profiles = hills(page).locator("figure img");
    await expect(profiles).toHaveCount(5);
    for (const img of await profiles.all()) await expect(img).toHaveAttribute("loading", "lazy");
    // The desktop source is the provisional 2× upscale, served at quality 90.
    expect(await hero(page).locator("picture source").getAttribute("srcset")).toContain("q=90");
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
    // Hills and club totals were redesigned in Round 2; their layout is checked below.
  });

  test("hill rows match Figma; run rows grow from Figma to fit their descriptions", async ({ page }, info) => {
    const f = frame(info.project.name);
    for (const li of await runs(page).locator("li").all()) expect((await box(li)).height).toBeGreaterThan(f.runRowH);
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

  test("keyboard order follows reading order through the homepage", async ({ page }, info) => {
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
    const hillNames = ["Cricket Hill", "Warren Hill", "Horner Hill", "Schiller Hill", "Mt. Trashmore"];
    const expected = [
      "See the full schedule",
      "Explore all hills",
      // phones: the touch preview buttons sit between the profile and the list
      ...(info.project.name === "mobile" ? hillNames : []),
      ...hillNames,
      "Find a Run",
      "Join Us",
    ];
    expect(order.slice(0, 3)).toEqual(["Find a Run", "Become a Mtn Runner", "Run details"]);
    // two run names (order depends on the build clock)
    expect(order.slice(3, 5).sort()).toEqual(["Cricket Mtn Repeats", "Horner Hell Repeats"]);
    expect(order.slice(5, 5 + expected.length)).toEqual(expected);
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
    // Round 2 secondary (white) CTA: hover is the MWDS secondary cream.
    const secondary = jsu(page).getByRole("link", { name: "Join Us" });
    await secondary.hover();
    await expect.poll(() => css(secondary, "background-color")).toBe("rgb(244, 241, 232)");
    const primary = jsu(page).getByRole("link", { name: "Find a Run" });
    await primary.hover();
    await expect.poll(() => css(primary, "background-color")).toBe("rgb(38, 38, 38)");
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
    ["hero Find a Run", (p) => hero(p).locator("[data-slot=cta-link]").nth(0), 4.5],
    ["hero Become a Mtn Runner", (p) => hero(p).locator("[data-slot=cta-link]").nth(1), 4.5],
    ["Just show up heading", (p) => p.locator("#just-show-up-heading"), 3],
    ["Just show up Find a Run", (p) => jsu(p).locator("[data-slot=cta-link]").nth(0), 4.5],
    ["Just show up Join Us", (p) => jsu(p).locator("[data-slot=cta-link]").nth(1), 4.5],
  ];

  /**
   * ACCEPTED ACCESSIBILITY EXCEPTIONS (Owner decision on PR #3, 2026-11-08).
   * The Owner restored the approved ghosted hero headline (60% white with a soft
   * halo) and the original Just show up treatment (30% shade, 90% white copy) and
   * accepted their known contrast shortfall for this iteration. They do NOT meet
   * WCAG AA 1.4.3 in their worst region and are not claimed to. They are measured
   * and recorded on every run, but deliberately not asserted against a threshold
   * (thresholds are not weakened; the two elements are simply outside the gate).
   * Every other photo-text target above stays asserted. See the Work Item.
   */
  const ACCEPTED_EXCEPTIONS: [string, (p: Page) => Locator, number][] = [
    ["hero headline", (p) => p.locator("#hero-heading"), 3],
    ["Just show up copy", (p) => p.locator("#just-show-up-heading + p"), 4.5],
  ];

  test("accepted exceptions are still measured and recorded (not asserted)", async ({ page }, info) => {
    await loadAll(page);
    for (const [name, locate, need] of ACCEPTED_EXCEPTIONS) {
      const r = await measureTextContrast(page, locate(page));
      info.annotations.push({ type: `exception ${name}`, description: `worst ${r.worst} vs ${need} needed (p10 ${r.p10}, median ${r.median}) — below threshold by Owner decision` });
      expect(r.cells, `${name}: measurable regions`).toBeGreaterThan(0);
    }
  });

  test("text over photography meets WCAG AA in its worst region (excluding the accepted exceptions)", async ({ page }, info) => {
    await loadAll(page);
    for (const [name, locate, need] of PHOTO_TEXT) {
      const r = await measureTextContrast(page, locate(page));
      info.annotations.push({ type: `contrast ${name}`, description: `worst ${r.worst} (p10 ${r.p10}, median ${r.median}) over ${r.cells} cells` });
      expect(r.cells, `${name}: measurable regions`).toBeGreaterThan(0);
      expect.soft(r.worst, `${name} worst-region contrast`).toBeGreaterThanOrEqual(need);
    }
  });

  test("photo text outside the accepted exceptions stays legible at intermediate widths", async ({ page }, info) => {
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

/** Mocked Formspree responses are cross-origin, like the real ones. */
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "POST, OPTIONS" };

test.describe("Round 2 interactions", () => {
  test("sticky header turns compact with a 1px black rule, and the logo returns to the top", async ({ page }) => {
    const header = page.locator("body > header");
    const tall = (await box(header)).height;
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(header).toHaveAttribute("data-compact", "");
    await expect.poll(async () => (await box(header)).height).toBeLessThan(tall - 20);
    expect((await box(header)).y).toBe(0); // still pinned to the top
    await expect.poll(() => css(header, "border-bottom-color")).toBe("rgb(0, 0, 0)");
    expect(await css(header, "border-bottom-width")).toBe("1px");
    expect(await css(header, "box-shadow")).toBe("none");
    await page.getByRole("link", { name: "Chicago Mountain Runners" }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
    await expect(header).not.toHaveAttribute("data-compact");
  });

  test("club figures roll once into their final values, which assistive tech reads directly", async ({ page }) => {
    const totals = page.locator("section[aria-labelledby=club-totals-heading]");
    const odometers = totals.locator("[data-odometer]");
    await expect(odometers.first()).toHaveAttribute("data-odometer", "armed"); // parked below the fold
    await totals.scrollIntoViewIfNeeded();
    await expect(odometers.first()).toHaveAttribute("data-odometer", "rolling");
    expect(await totals.locator("dd .sr-only").allTextContents()).toEqual(["132K ft", "2.5K", "2", "240"]);
    // Circles stay put (relative to their section) while digits move.
    const circle = totals.locator("[data-slot=total]").first();
    // Both boxes in one read, so a settling sticky header can't skew the difference.
    const offset = () => circle.evaluate((el) => el.getBoundingClientRect().y - el.closest("section")!.getBoundingClientRect().y);
    const before = await offset();
    await page.waitForTimeout(2200);
    expect(await offset()).toBeCloseTo(before, 1);
    // Settled: every strip shows its final digit inside its clip.
    const settled = await totals.locator("dd").evaluateAll((dds) =>
      dds.map((dd) =>
        [...dd.querySelectorAll<HTMLElement>("[style*=translateY]")].every((strip) => {
          const clip = strip.parentElement!.getBoundingClientRect();
          const last = strip.lastElementChild!.getBoundingClientRect();
          return Math.abs(last.top - clip.top) < 1;
        }),
      ),
    );
    expect(settled).toEqual([true, true, true, true]);
  });

  test("reduced motion: figures and topography stay static", async ({ browser, page }) => {
    const reduced = await browser.newPage({ reducedMotion: "reduce", viewport: page.viewportSize()! });
    await reduced.goto("/");
    await reduced.locator("section[aria-labelledby=club-totals-heading]").scrollIntoViewIfNeeded();
    for (const o of await reduced.locator("[data-odometer]").all()) await expect(o).toHaveAttribute("data-odometer", "settled");
    await expect(reduced.locator("[data-slot=topo-field]")).not.toHaveAttribute("data-live");
    await reduced.close();
  });

  test("hill rows preview their profile on hover and focus, without moving the layout", async ({ page }, info) => {
    const shown = () => hills(page).locator("[data-slot=hill-profiles] > [data-active]");
    await expect(shown()).toHaveAttribute("data-hill", "mt-trashmore");
    // Section height and the list's offset inside it, read in one pass so a
    // settling sticky header can't skew them.
    const layout = () =>
      hills(page).evaluate((sec) => {
        const s = sec.getBoundingClientRect(), l = sec.querySelector("ol")!.getBoundingClientRect();
        return { height: s.height, listOffset: l.y - s.y };
      });
    const before = await layout();
    // All five drawings are fetched together, so switching never waits on the network.
    await hills(page).scrollIntoViewIfNeeded();
    await expect
      .poll(() => hills(page).locator("figure img").evaluateAll((imgs) => imgs.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0)))
      .toBe(true);
    if (info.project.name === "desktop") {
      await hills(page).locator("li").nth(2).hover();
      await expect(shown()).toHaveAttribute("data-hill", "horner-hill");
      await expect(hills(page).locator("li").nth(2)).toHaveAttribute("data-active");
    }
    await hills(page).getByRole("link", { name: "Cricket Hill" }).focus();
    await expect(shown()).toHaveAttribute("data-hill", "cricket-hill");
    const after = await layout();
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.listOffset - before.listOffset)).toBeLessThanOrEqual(1);
  });

  test("touch-sized screens get explicit preview buttons; rows still navigate", async ({ page }, info) => {
    const group = hills(page).getByRole("group", { name: "Preview a hill profile" });
    if (info.project.name !== "mobile") {
      await expect(group).toBeHidden();
      return;
    }
    await expect(group).toBeVisible();
    const warren = group.getByRole("button", { name: "Warren Hill" });
    await warren.click();
    await expect(warren).toHaveAttribute("aria-pressed", "true");
    await expect(hills(page).locator("[data-slot=hill-profiles] > [data-active]")).toHaveAttribute("data-hill", "warren-hill");
    // Interpretive profile: no figures, and it says so.
    const fig = hills(page).locator("[data-hill=warren-hill] figure");
    await expect(fig).toContainText("Not measured yet");
    await expect(fig).not.toContainText("≈");
  });

  test("the liquid topography runs only on fine pointers, and goes idle when the pointer rests", async ({ page }, info) => {
    const field = flat(page).locator("[data-slot=topo-field]");
    await flat(page).scrollIntoViewIfNeeded();
    if (info.project.name !== "desktop") return; // Desktop Chrome emulation in every project; the sweep is enough once
    await expect(field).toHaveAttribute("data-live");
    const b = await box(flat(page));
    await page.mouse.move(b.x + 100, b.y + b.height / 2);
    for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + 100 + i * 40, b.y + b.height / 2 + (i % 2) * 20);
    const scale = () => field.locator("feDisplacementMap").getAttribute("scale").then(Number);
    expect(await scale()).toBeGreaterThan(0);
    // The statement never moves (measured against its section in one read).
    const textOffset = () =>
      flat(page).locator("p").evaluate((el) => {
        const a = el.getBoundingClientRect(), b = el.closest("section")!.getBoundingClientRect();
        return [a.x - b.x, a.y - b.y, a.width, a.height];
      });
    const text = await textOffset();
    await expect.poll(scale, { timeout: 4000 }).toBe(0);
    expect(await textOffset()).toEqual(text);
  });

  test("the Questions panel validates, sends through Formspree (mocked) and confirms", async ({ page }) => {
    const posted: string[] = [];
    await page.unroute("https://formspree.io/**");
    await page.route("https://formspree.io/**", async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
      posted.push(route.request().url());
      await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
    });
    const trigger = page.getByRole("button", { name: "Questions?" });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Questions about the club?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Your question")).toBeFocused();
    const panel = await box(dialog);
    const vp = page.viewportSize()!;
    expect(panel.x).toBeGreaterThanOrEqual(0);
    expect(panel.x + panel.width).toBeLessThanOrEqual(vp.width);
    expect(panel.y).toBeGreaterThanOrEqual(0);

    await dialog.getByRole("button", { name: "Send question" }).click();
    await expect(dialog.getByLabel("Your question")).toHaveAttribute("aria-invalid", "true");
    expect(posted).toEqual([]);

    await dialog.getByLabel("Your question").fill("Is there a pace group for beginners?");
    await dialog.getByLabel("Email").fill("runner@example.com");
    await dialog.getByRole("button", { name: "Send question" }).click();
    await expect(dialog.getByRole("status")).toContainText("your question is on its way");
    expect(posted).toEqual(["https://formspree.io/f/mwlljgld"]);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a failed delivery is reported and never confirmed", async ({ page }) => {
    await page.unroute("https://formspree.io/**");
    await page.route("https://formspree.io/**", (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: CORS })
        : route.fulfill({ status: 500, headers: CORS, contentType: "application/json", body: JSON.stringify({ errors: [{ message: "Server error." }] }) }),
    );
    await page.getByRole("button", { name: "Questions?" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Your question").fill("Hello?");
    await dialog.getByLabel("Email").fill("runner@example.com");
    await dialog.getByRole("button", { name: "Send question" }).click();
    await expect(dialog.getByRole("alert")).toContainText("didn't send");
    await expect(dialog.getByRole("status")).toHaveCount(0);
  });

  test("the open Questions panel has no axe violations", async ({ page }) => {
    await page.getByRole("button", { name: "Questions?" }).click();
    expect(await axe(page)).toEqual([]);
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
