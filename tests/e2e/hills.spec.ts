import { expect, test, type Locator, type Page } from "@playwright/test";
import { measureTextContrast } from "./contrast.mjs";

/**
 * Chicago Hills browser checks at the three frame widths (mobile 393, tablet
 * 768, desktop 1440). Figma: Hill Details / Desktop 1:6363, Tablet 1:6703,
 * Mobile 1:7032. /hills has no Figma frame (composed; see the Work Item).
 */

const AXE_PATH = require.resolve("axe-core");
const SLUGS = ["cricket-hill", "warren-hill", "horner-hill", "schiller-hill", "mt-trashmore"] as const;
const NAMES = ["Cricket Hill", "Warren Hill", "Horner Hill", "Schiller Hill", "Mt. Trashmore"];

/**
 * Per frame. Hero height is Figma's, below the sticky header. The hero name is
 * the refinement pass's larger size (60 / 104 / 176; on phones capped to the
 * column: (393 − 48) / 6.4 ≈ 53.9). Display = "Get high in the city.".
 */
const FIGMA = {
  // Hero 25% under Figma's 540 / 697 / 844 (PR #4 final pass).
  mobile: { heroH: 405, h1: 53.9, lede: 36, display: 48 },
  tablet: { heroH: 522.75, h1: 104, lede: 36, display: 54 },
  desktop: { heroH: 633, h1: 176, lede: 64, display: 96 },
} as const;
const spec = (name: string) => FIGMA[name as keyof typeof FIGMA];

const box = async (l: Locator) => (await l.boundingBox())!;
const css = (l: Locator, prop: string, pseudo?: string) =>
  l.evaluate((el, [p, ps]) => getComputedStyle(el, ps ?? null).getPropertyValue(p!), [prop, pseudo] as const);

async function axe(page: Page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v: { id: string; nodes: { target: string[] }[] }) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}

async function loadAll(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    window.scrollTo(0, 0);
  });
}

/** Wait for CSS transitions on an element (the contour canvas fades in). */
const settled = (l: Locator) => l.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
/** Browser tests run on software WebGL, where ContourField holds still by design; this opts a page into the animation. */
const forceMotion = (p: Page) => p.addInitScript(() => Object.assign(window, { __CMR_CONTOUR_FORCE_MOTION__: true }));

const overflowX = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.beforeEach(async ({ page }) => {
  // Never reach the live Formspree form (Owner instruction) or a map service from tests.
  await page.route("https://formspree.io/**", (r) => r.abort());
  await page.route("https://www.google.com/maps/**", (r) => r.abort());
});

test.describe("/hills directory", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hills");
    await page.evaluate(() => document.fonts.ready);
  });

  test("title, heading and the five hills in order, each linked", async ({ page }) => {
    await expect(page).toHaveTitle("Chicago Hills | Chicago Mountain Runners");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chicago Hills Mountains");
    const rows = page.locator("main ol > li");
    await expect(rows).toHaveCount(5);
    for (const [i, slug] of SLUGS.entries()) {
      await expect(rows.nth(i).getByRole("link")).toHaveAttribute("href", `/hills/${slug}`);
      await expect(rows.nth(i).getByRole("heading", { level: 2 })).toHaveText(NAMES[i]);
    }
    // The rise footnote, the provisional tag and the status note are gone (Owner direction);
    // the status stays in the markup.
    await expect(page.getByText(/USGS 3DEP/)).toHaveCount(0);
    await expect(page.locator("main [data-provisional], main [data-slot=content-status]")).toHaveCount(0);
    await expect(page.getByText("Hill details are unconfirmed. Rise figures are approximate.")).toHaveCount(0);
    await expect(rows.first()).toHaveAttribute("data-status", "provisional");
    await expect(page.locator("main ol [data-hill-profile]")).toHaveCount(0);
  });

  test("headline: no eyebrow, “Chicago H̶i̶l̶l̶s̶” on one line and “Mountains” alone on the second", async ({ page }) => {
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(page.locator("main section").first().locator("p").first()).not.toContainText("hills ·");
    for (const w of [320, 393, 768, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      const [first, second] = await h1.locator(":scope > span").evaluateAll((els) =>
        els.map((e) => ({ top: e.getBoundingClientRect().top, h: e.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(e).lineHeight) })),
      );
      expect(second.top, `${w}px`).toBeGreaterThan(first.top);
      expect(first.h, `${w}px: one line`).toBeLessThan(first.lh * 1.5);
      expect(second.h, `${w}px: one line`).toBeLessThan(second.lh * 1.5);
    }
  });

  test("rows: no numbers, Grass/dirt, Weekly with CMR", async ({ page }) => {
    const rows = page.locator("main ol > li");
    for (const r of await rows.all()) await expect(r).not.toContainText(/\b0[1-5]\b/);
    await expect(page.getByText("With CMR", { exact: true })).toHaveCount(0);
    await expect(rows.nth(1)).toContainText("No set weekly run");
    await expect(rows.nth(1)).toContainText("Grass/dirt");
  });

  test("the header marks Hills as the current section", async ({ page }) => {
    await expect(page.locator("header").getByRole("link", { name: /Chicago.*Mtns/ })).toHaveAttribute("aria-current", "page");
  });

  test("the whole row is clickable (clicking empty row space opens the hill)", async ({ page }) => {
    // A real click away from the name: the row link's ::after must be what receives it.
    const row = page.locator("main ol > li").nth(2);
    await row.scrollIntoViewIfNeeded();
    const b = await box(row);
    await page.mouse.click(b.x + b.width - 60, b.y + 8);
    await expect(page).toHaveURL(/\/hills\/horner-hill$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Horner Hill");
  });

  test("hover and keyboard focus reveal one shared contour layer through the active row; focus rings the row", async ({ page }, info) => {
    await page.addInitScript(() => Object.assign(window, { __CMR_CONTOUR_FORCE_MOTION__: true }));
    await page.reload();
    const rows = page.locator("main ol > li");
    const layer = page.locator("[data-slot=directory-hover-field]");
    await expect(layer).toHaveCount(1);
    await expect(page.locator("main canvas")).toHaveCount(0); // nothing until a row is active
    const clipMatchesRow = async (i: number) => {
      const [r, w, clip] = await Promise.all([
        box(rows.nth(i)),
        box(layer),
        layer.evaluate((el) => (el as HTMLElement).style.clipPath),
      ]);
      const top = Number(/inset\(([\d.]+)px/.exec(clip)?.[1]);
      expect(Math.abs(top - (r.y - w.y))).toBeLessThanOrEqual(1);
    };
    if (info.project.name === "desktop") {
      await rows.nth(0).hover();
      await expect(layer).toHaveAttribute("data-active");
      await clipMatchesRow(0);
      await rows.nth(3).hover();
      await clipMatchesRow(3);
      // Still one WebGL canvas after hovering several rows, animating while shown.
      await expect(page.locator("main canvas")).toHaveCount(1);
      await expect(layer.locator("[data-slot=contour-field]")).toHaveAttribute("data-state", "animating");
      // No hover background colour on the row itself.
      expect(await css(rows.nth(3), "background-color")).toBe("rgba(0, 0, 0, 0)");
      // Leaving the list hides it and pauses the animation.
      await page.mouse.move(5, 5);
      await expect(layer).not.toHaveAttribute("data-active");
      await expect(layer.locator("[data-slot=contour-field]")).toHaveAttribute("data-state", "paused");
    }
    const link = rows.first().getByRole("link");
    await link.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    await expect(layer).toHaveAttribute("data-active");
    await clipMatchesRow(0);
    expect(await css(link, "box-shadow", "::after")).toMatch(/0px 0px 0px 3px/);
    const rowBox = await box(rows.first());
    const after = await link.evaluate((el) => {
      const s = getComputedStyle(el, "::after");
      return { position: s.position, w: s.width };
    });
    expect(after.position).toBe("absolute");
    expect(parseFloat(after.w)).toBeCloseTo(rowBox.width, 0);
  });

  test("the intro uses the Cricket Hill description's body-text color", async ({ page }) => {
    const intro = await css(page.locator("main section").first().locator("p").first(), "color");
    await page.goto("/hills/cricket-hill");
    const cricket = await css(page.locator("section[aria-labelledby=about-heading] p").first(), "color");
    expect(intro).toBe(cricket);
    await page.goto("/");
    expect(await css(page.locator("section[aria-labelledby=hills-heading] h2 + p"), "color")).toBe(cricket);
  });

  test("comparison columns line up on desktop", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "one-row layout is desktop only");
    const rises = page.locator("main ol > li dl > div:first-child");
    const xs = await rises.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(new Set(xs).size).toBe(1);
    // Per-row labels are visually hidden on desktop (the header row carries them).
    await expect(page.locator("main ol > li dt").first()).toHaveClass(/lg:sr-only/);
  });

  test("no horizontal overflow, 320 to 1920", async ({ page }) => {
    for (const w of [320, 360, 393, 600, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      expect(await overflowX(page), `${w}px`).toBeLessThanOrEqual(0);
    }
  });

  test("axe (WCAG 2.2 AA incl. contrast): clean", async ({ page }) => {
    await loadAll(page);
    expect(await axe(page)).toEqual([]);
  });

  test("the closing band is the homepage “Just show up.”, leading to the calendar and Join", async ({ page }) => {
    const band = page.locator("section[aria-labelledby=just-show-up-heading]");
    await expect(band.getByRole("heading")).toHaveText("JUST SHOW UP.");
    await expect(page.locator("section[aria-labelledby=pick-heading]")).toHaveCount(0);
    // Last section before the footer.
    expect(await page.locator("main > section").last().getAttribute("aria-labelledby")).toBe("just-show-up-heading");
    await expect(band.getByRole("link", { name: "Find a Run" })).toHaveAttribute("href", "/calendar");
    await expect(band.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
  });
});

test.describe("hill detail pages", () => {
  for (const [i, slug] of SLUGS.entries()) {
    test(`${slug}: renders, has metadata, and passes axe`, async ({ page }) => {
      const res = await page.goto(`/hills/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(`${NAMES[i]} | Chicago Mountain Runners`);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(NAMES[i]);
      await expect(page.locator("header").getByRole("link", { name: /Chicago.*Mtns/ })).toHaveAttribute("aria-current", "page");
      await loadAll(page);
      expect(await axe(page)).toEqual([]);
      expect(await overflowX(page)).toBeLessThanOrEqual(0);
    });
  }

  test("the placeholder hill has no page", async ({ page }) => {
    const res = await page.goto("/hills/example-hill");
    expect(res?.status()).toBe(404);
  });

  test("geometry: hero height, two-line name, lede size, no stats strip or profile section", async ({ page }, info) => {
    const f = spec(info.project.name);
    await page.goto("/hills/warren-hill");
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator("section[aria-labelledby=hill-heading]");
    expect(Math.abs((await box(hero)).height - f.heroH)).toBeLessThanOrEqual(2);
    expect(parseFloat(await css(page.locator("#hill-heading"), "font-size"))).toBeCloseTo(f.h1, 0);
    const words = await page.locator("#hill-heading > span").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(words).toHaveLength(2);
    expect(words[1]).toBeGreaterThan(words[0]);
    expect(await hero.locator("p").count()).toBe(0); // no eyebrow
    expect(parseFloat(await css(page.locator("section[aria-label=Overview] p").first(), "font-size"))).toBeCloseTo(f.lede, 0);
    await expect(page.locator("[data-slot=hill-stat], #profile-heading")).toHaveCount(0);
    // The breadcrumb sits directly below the hero.
    expect(await hero.evaluate((h) => h.nextElementSibling?.getAttribute("aria-label"))).toBe("Breadcrumb");
  });

  test("the longest hero name fits the column at every width", async ({ page }) => {
    await page.goto("/hills/mt-trashmore");
    await page.evaluate(() => document.fonts.ready);
    for (const w of [320, 360, 393, 600, 768, 1024, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      const right = await page.locator("#hill-heading > span").evaluateAll((els) => Math.max(...els.map((e) => {
        const r = document.createRange();
        r.selectNodeContents(e);
        return r.getBoundingClientRect().right;
      })));
      expect(right, `${w}px`).toBeLessThanOrEqual(w - 16);
    }
  });

  test("hero background: animated contour lines, still under reduced motion or software WebGL", async ({ browser, page }) => {
    // As shipped, on this (software) renderer: one still frame.
    await page.goto("/hills/horner-hill");
    const field = page.locator("section[aria-labelledby=hill-heading] [data-slot=contour-field]");
    await expect(field).not.toHaveAttribute("data-state", "pending");
    await expect(field).toHaveAttribute("aria-hidden", "true");
    const canvas = field.locator("canvas");
    if ((await field.getAttribute("data-still")) === "software") {
      await settled(canvas);
      const s1 = await canvas.screenshot();
      await page.waitForTimeout(1000);
      expect(Buffer.compare(s1, await canvas.screenshot()), "software WebGL: one still frame").toBe(0);
    }
    // Grey lines, not white: MWDS neutrals 500 since the final pass (lighter, larger, sparser contours; was neutrals 600).
    expect(await css(canvas, "color")).toBe("rgb(115, 115, 115)");

    // The animation itself (forced on, as a GPU would run it).
    const moving = await browser.newPage({ viewport: page.viewportSize()! });
    await forceMotion(moving);
    await moving.goto("/hills/horner-hill");
    const mField = moving.locator("section[aria-labelledby=hill-heading] [data-slot=contour-field]");
    await expect(mField).toHaveAttribute("data-state", "animating");
    const a = await mField.locator("canvas").screenshot();
    await moving.waitForTimeout(1500);
    expect(Buffer.compare(a, await mField.locator("canvas").screenshot()), "the lines move").not.toBe(0);
    await moving.close();

    // Reduced motion wins, even when forced.
    const reduced = await browser.newPage({ reducedMotion: "reduce", viewport: page.viewportSize()! });
    await forceMotion(reduced);
    await reduced.goto("/hills/horner-hill");
    const still = reduced.locator("section[aria-labelledby=hill-heading] [data-slot=contour-field]");
    await expect(still).toHaveAttribute("data-state", "still");
    await expect(still).toHaveAttribute("data-still", "reduced-motion");
    const s1 = await still.locator("canvas").screenshot();
    await reduced.waitForTimeout(1000);
    expect(Buffer.compare(s1, await still.locator("canvas").screenshot()), "reduced motion: one still frame").toBe(0);
    await reduced.close();
  });

  test("the hero text is legible over the moving lines", async ({ page }, info) => {
    await page.goto("/hills/cricket-hill");
    await expect(page.locator("section[aria-labelledby=hill-heading] [data-slot=contour-field]")).not.toHaveAttribute("data-state", "pending");
    await page.evaluate(() => document.fonts.ready);
    for (const [name, locate, need] of [
      ["hill name", page.locator("#hill-heading"), 3],
      ["breadcrumb", page.getByRole("navigation", { name: "Breadcrumb" }), 4.5],
    ] as const) {
      const r = await measureTextContrast(page, locate);
      info.annotations.push({ type: `contrast ${name}`, description: `worst ${r.worst} (median ${r.median}) over ${r.cells} cells` });
      expect(r.cells, `${name}: measurable regions`).toBeGreaterThan(0);
      expect.soft(r.worst, `${name} worst-region contrast`).toBeGreaterThanOrEqual(need);
    }
  });

  test("section headings use the homepage “Get high in the city.” size; two-line headings hold two lines from tablet", async ({ page }, info) => {
    const f = spec(info.project.name);
    await page.goto("/hills/cricket-hill");
    await page.evaluate(() => document.fonts.ready);
    for (const sel of ["#about-heading", "#repeats-heading", "#find-heading", "#more-heading", "#runs-heading + ul h3"]) {
      expect(parseFloat(await css(page.locator(sel), "font-size")), sel).toBeCloseTo(f.display, 0);
    }
    if (info.project.name === "mobile") return; // 48px can't hold "How tall you need it?" in 345px
    const lines = await page.locator("#repeats-heading > span").evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)),
    );
    expect(lines.map(Math.round), "#repeats-heading").toEqual([1, 1]);
  });

  test("repeats: wide support copy, then four circles on one row (2 × 2 on phones), Cricket Hill's derived counts and miles", async ({ page }, info) => {
    await page.goto("/hills/cricket-hill");
    const section = page.locator("section[aria-labelledby=repeats-heading]");
    const circles = section.locator("[data-slot=repeat-circle]");
    await expect(circles).toHaveCount(4);
    await expect(section.locator("dd .sr-only")).toHaveText([
      "13 repeats, about 2.6 miles",
      "25 repeats, about 5 miles",
      "63 repeats, about 12.6 miles",
      "125 repeats, about 25 miles",
    ]);
    await expect(section.locator("[data-slot=repeat-miles]")).toHaveText(["2.6 miles", "5 miles", "12.6 miles", "25 miles"]);
    // The Owner's route language, verbatim.
    await expect(section.locator("p").first()).toHaveText(
      "One repeat isn't much of a mountain. That's what the next repeat is for. The following number of repeats are approximations only and based on specific routes mapped by CMR. The Cricket Hill route is .2 miles up and down.",
    );
    await expect(section.locator("img")).toHaveCount(0);
    const copy = await box(section.locator("p").first());
    if (info.project.name === "desktop") expect(copy.width).toBeGreaterThan(560); // the run line / footer sentence measure
    const boxes = await circles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y), w: r.width, h: r.height })));
    for (const b of boxes) {
      expect(Math.abs(b.w - b.h)).toBeLessThanOrEqual(1);
      expect(b.y).toBeGreaterThan(copy.y + copy.height); // under the copy
    }
    if (info.project.name === "mobile") {
      expect(new Set(boxes.map((b) => b.y)).size).toBe(2);
    } else {
      expect(new Set(boxes.map((b) => b.y)).size).toBe(1);
      const container = await box(section.locator(":scope > div"));
      const pad = parseFloat(await css(section.locator(":scope > div"), "padding-left"));
      expect(Math.abs(boxes[0].x - (container.x + pad))).toBeLessThanOrEqual(1); // spread edge to edge
      expect(Math.abs(boxes[3].x + boxes[3].w - (container.x + container.width - pad))).toBeLessThanOrEqual(1);
    }
  });

  test("a hill with no mapped route keeps the quadrant, reading TBD", async ({ page }) => {
    await page.goto("/hills/schiller-hill");
    const section = page.locator("section[aria-labelledby=repeats-heading]");
    await expect(section.locator("[data-slot=repeat-circle]")).toHaveCount(4);
    await expect(section.locator("[data-slot=repeat-circle]").first()).toContainText("TBD");
    await expect(section.locator("[data-slot=repeat-miles]")).toHaveText(Array(4).fill("TBD"));
    await expect(section).toContainText("CMR hasn't mapped a route on Schiller Hill yet");
  });

  test("no visible provisional tag or note on a hill page; status stays in the markup", async ({ page }) => {
    await page.goto("/hills/cricket-hill");
    await expect(page.locator("main [data-provisional], main [data-slot=content-status]")).toHaveCount(0);
    await expect(page.locator("section[aria-label=Overview]")).toHaveAttribute("data-status", "provisional");
    await expect(page.getByText("One of Chicago Mountain Runners' primary training hills.")).toHaveCount(0);
  });

  test("Hill → Run → Hill: the run band links the run, whose page links back", async ({ page }) => {
    await page.goto("/hills/cricket-hill");
    await page.getByRole("link", { name: "View run: Cricket Mtn Repeats" }).click();
    await expect(page).toHaveURL(/\/calendar\/cricket-mtn-repeats$/);
    await page.getByRole("link", { name: "Cricket Hill" }).click();
    await expect(page).toHaveURL(/\/hills\/cricket-hill$/);
  });

  test("a hill without a CMR run says so", async ({ page }) => {
    await page.goto("/hills/schiller-hill");
    await expect(page.getByRole("heading", { name: "No set weekly run." })).toBeVisible();
  });

  test("map links open off-site in a new tab, and nothing is fetched from a map service", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (r) => {
      if (!r.url().startsWith("http://localhost")) external.push(r.url());
    });
    await page.goto("/hills/horner-hill");
    await loadAll(page);
    const dir = page.getByRole("link", { name: /Get directions/ });
    await expect(dir).toHaveAttribute("target", "_blank");
    await expect(dir).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=Horner%20Park/);
    expect(external).toEqual([]);
    // The map is a local static image (OpenStreetMap, built once), credited.
    const map = page.locator("[data-slot=hill-map]");
    await expect(map.locator("img")).toHaveJSProperty("complete", true);
    expect(await map.locator("img").evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    await expect(map.getByRole("link", { name: "OpenStreetMap" })).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
  });

  test("Find section: heading, address, actions and note in the left half, map opposite; three heading lines on desktop", async ({ page }, info) => {
    for (const slug of SLUGS) {
      await page.goto(`/hills/${slug}`);
      await page.evaluate(() => document.fonts.ready);
      const section = page.locator("section[aria-labelledby=find-heading]");
      const heading = section.locator("#find-heading");
      await expect(heading).toHaveText("Find what you've been looking for.");
      const map = section.locator("[data-slot=hill-map]");
      const [h, m, note, sec] = await Promise.all([box(heading), box(map), box(section.locator("p").last()), box(section.locator(":scope > div"))]);
      if (info.project.name === "mobile") {
        expect(m.y, slug).toBeGreaterThan(note.y + note.height); // stacked: text, then the map
        continue;
      }
      // Two halves: the heading sits in the left column, opposite the map (no longer spanning).
      expect(h.x + h.width, slug).toBeLessThan(m.x);
      expect(Math.abs(m.x + m.width / 2 - (sec.x + sec.width * 0.75)), slug).toBeLessThanOrEqual(sec.width * 0.06);
      // The map is centred vertically against the left column.
      const leftTop = h.y, leftBottom = note.y + note.height;
      expect(Math.abs(m.y + m.height / 2 - (leftTop + leftBottom) / 2), slug).toBeLessThanOrEqual(4);
      if (info.project.name === "desktop") {
        const spans = await heading.locator(":scope > span").evaluateAll((els) =>
          els.map((e) => ({ t: e.textContent, lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) })),
        );
        expect(spans, slug).toEqual([
          { t: "Find what", lines: 1 },
          { t: "you've been", lines: 1 },
          { t: "looking for.", lines: 1 },
        ]);
      }
    }
  });

  test("the map eases in slightly on hover, about its centre; not under reduced motion", async ({ browser, page }, info) => {
    test.skip(info.project.name !== "desktop", "hover");
    await page.goto("/hills/horner-hill");
    const map = page.locator("[data-slot=hill-map]");
    const img = map.locator("img");
    await map.scrollIntoViewIfNeeded();
    // Tailwind v4 scales with the individual `scale` property.
    expect(await css(img, "scale")).toBe("none");
    await map.hover();
    await expect.poll(() => css(img, "scale"), { timeout: 3000 }).toBe("1.06");
    // About the centre, so the pin (drawn at the centre) stays on the place.
    const [ox, oy] = (await css(img, "transform-origin")).split(" ").map(parseFloat);
    const ib = await box(img);
    expect(Math.abs(ox - ib.width / 1.06 / 2)).toBeLessThanOrEqual(2);
    expect(Math.abs(oy - ib.height / 1.06 / 2)).toBeLessThanOrEqual(2);

    const reduced = await browser.newPage({ reducedMotion: "reduce", viewport: page.viewportSize()! });
    await reduced.goto("/hills/horner-hill");
    const rMap = reduced.locator("[data-slot=hill-map]");
    await rMap.scrollIntoViewIfNeeded();
    await rMap.hover();
    await reduced.waitForTimeout(400);
    expect(await css(rMap.locator("img"), "scale")).toBe("none");
    await reduced.close();
  });

  test("breadcrumb and More hills lead back into the directory", async ({ page }) => {
    await page.goto("/hills/horner-hill");
    const more = page.locator("section[aria-labelledby=more-heading]");
    await expect(more.getByRole("heading", { level: 2 })).toHaveText("More hills on repeat.");
    await expect(more.locator("ul > li")).toHaveCount(4);
    await expect(more.locator("[data-hill-profile], dl")).toHaveCount(0); // names only: no drawings or columns
    await expect(more.locator("ul > li").first().getByRole("link")).toHaveAttribute("href", "/hills/schiller-hill");
    await more.getByRole("link", { name: "All hills" }).click();
    await expect(page).toHaveURL(/\/hills$/);
    await page.goto("/hills/horner-hill");
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link").click();
    await expect(page).toHaveURL(/\/hills$/);
  });

  test("no horizontal overflow, 320 to 1920", async ({ page }) => {
    for (const slug of ["cricket-hill", "warren-hill"]) {
      await page.goto(`/hills/${slug}`);
      for (const w of [320, 360, 393, 600, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width: w, height: 900 });
        expect(await overflowX(page), `${slug} at ${w}px`).toBeLessThanOrEqual(0);
      }
    }
  });
});

test.describe("from the homepage", () => {
  test("“Explore all hills” and each hill row reach the new pages", async ({ page }) => {
    await page.goto("/");
    const hills = page.locator("section[aria-labelledby=hills-heading]");
    await hills.getByRole("link", { name: "Explore all hills" }).click();
    await expect(page).toHaveURL(/\/hills$/);
    await page.goto("/");
    await hills.getByRole("link", { name: "Mt. Trashmore" }).click();
    await expect(page).toHaveURL(/\/hills\/mt-trashmore$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mt. Trashmore");
  });
});

test.describe("visual @visual", () => {
  // Reduced motion: the contour background renders one deterministic still frame.
  test.use({ reducedMotion: "reduce" });
  for (const path of ["/hills", "/hills/cricket-hill", "/hills/warren-hill"]) {
    test(`full page ${path}`, async ({ page }, info) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await loadAll(page);
      for (const f of await page.locator("[data-slot=contour-field]").all()) await expect(f).toHaveAttribute("data-state", "still");
      const name = path.replaceAll("/", "-").slice(1);
      await expect(page).toHaveScreenshot(`${name}-${info.project.name}.png`, { fullPage: true, animations: "disabled" });
    });
  }
});
