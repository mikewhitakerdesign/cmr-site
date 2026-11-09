import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The Science (/the-science) at 393 / 768 / 1440: the sticky section bar
 * under the site header, anchors and fragment URLs, the current-section
 * indicator, keyboard use, reduced motion, the interactive figures, layout
 * and axe (including contrast).
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
const box = async (l: Locator) => (await l.boundingBox())!;
const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
const SECTIONS = ["physics", "physiology", "training", "breathing", "the-mind", "descending", "workouts", "sources"];
const LABELS = ["Physics", "Physiology", "Training", "Breathing", "The Mind", "Descending", "Workouts", "Sources"];

const sectionNav = (page: Page) => page.getByRole("navigation", { name: "On this page" });
const headerBar = (page: Page) => page.locator("body > header [data-slot=header-bar]");

/** Bottom of the header's visible bar (it may be translated on phones). */
const barBottom = (page: Page) => page.evaluate(() => document.querySelector("body > header [data-slot=header-bar]")!.getBoundingClientRect().bottom);

/** Wait until scrolling (smooth or not) has stopped. */
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1;
        let still = 0;
        const tick = () => {
          const y = window.scrollY;
          still = y === last ? still + 1 : 0;
          last = y;
          if (still >= 8) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
  await page.waitForTimeout(500); // the header's 300ms transition, and the bar following it
}

test.beforeEach(async ({ page }) => {
  await page.goto("/the-science");
  await page.evaluate(() => document.fonts.ready);
});

test.describe("content and layout", () => {
  test("title, metadata, hero copy and the nine parts in order", async ({ page }) => {
    await expect(page).toHaveTitle("The Science | Chicago Mountain Runners");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /hill repeats/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("THE SCIENCE OF GOING NOWHERE.");
    await expect(page.getByText("The surprisingly legitimate benefits of running uphill. Repeatedly. In Chicago.")).toBeVisible();
    const ids = await page.locator("main section[data-slot=science-section]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(SECTIONS);
    await expect(page.locator("#sources h2")).toHaveText("Sources");
  });

  test("The Science is in the primary navigation and marked current", async ({ page }) => {
    const link = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "The Science" });
    await expect(link).toHaveAttribute("href", "/the-science");
    await expect(link).toHaveAttribute("aria-current", "page");
  });

  test("no photographs, only monochrome graphics", async ({ page }) => {
    await expect(page.locator("main img, main picture, main video")).toHaveCount(0);
    // Every stroke and fill in the page's SVG graphics resolves to black, white or a gray.
    const colors = await page.locator("main svg").evaluateAll((svgs) => {
      const out = new Set<string>();
      for (const svg of svgs)
        for (const el of [svg, ...svg.querySelectorAll("*")]) {
          const cs = getComputedStyle(el);
          // Pattern fills (the runner's hatching) are drawn in currentColor; their lines are checked as strokes.
          for (const c of [cs.stroke, cs.fill]) if (c && c !== "none" && !c.startsWith("url(")) out.add(c);
        }
      return [...out];
    });
    for (const c of colors) {
      // Opacity variants of a token resolve to oklab(); neutral means zero chroma (a = b = 0).
      const lab = c.match(/oklab\(\s*[\d.]+\s+(-?[\d.]+)\s+(-?[\d.]+)/);
      if (lab) {
        expect(Math.abs(Number(lab[1])) + Math.abs(Number(lab[2])), `${c} is not a neutral`).toBeLessThan(0.001);
        continue;
      }
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      expect(m, c).not.toBeNull();
      const [r, g, b] = m!.slice(1).map(Number);
      expect(r === g && g === b, `${c} is not a neutral`).toBe(true);
    }
  });

  test("the page never scrolls sideways", async ({ page }) => {
    expect(await noHScroll(page)).toBe(true);
    await page.locator("#sources").scrollIntoViewIfNeeded();
    expect(await noHScroll(page)).toBe(true);
  });

  test("passes axe (including contrast) at the top and in the body", async ({ page }) => {
    expect(await axe(page)).toEqual([]);
  });
});

test.describe("sticky section bar", () => {
  test("is one row, sticks directly under the header's visible bar and never covers it", async ({ page }, info) => {
    const nav = sectionNav(page);
    const ys = await nav.getByRole("link").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().y)));
    expect(new Set(ys).size).toBe(1); // a single row, at every width
    expect(await nav.getByRole("link").allTextContents()).toEqual(LABELS);

    // Scroll down into the body: the header changes state (compact; or on phones the top row slides away).
    await page.evaluate(() => window.scrollTo({ top: document.getElementById("training")!.offsetTop, behavior: "instant" }));
    await settle(page);
    const top = (await box(nav)).y;
    expect(Math.abs(top - (await barBottom(page)))).toBeLessThanOrEqual(1);
    if (info.project.name === "mobile") expect(Math.round(top)).toBe(50); // link row + rules only
    else expect(top).toBeLessThan(80); // compact bar

    // Scroll up a little: on phones the header's top row returns, and the bar follows it down.
    for (let i = 0; i < 3; i++) await page.mouse.wheel(0, -60);
    await settle(page);
    const after = (await box(nav)).y;
    expect(Math.abs(after - (await barBottom(page)))).toBeLessThanOrEqual(1);
    if (info.project.name === "mobile") expect(Math.round(after)).toBe(114);
    expect((await box(headerBar(page))).y + (await box(headerBar(page))).height).toBeLessThanOrEqual(after + 1);
  });

  test("scrolls sideways on narrow screens without moving the page", async ({ page }, info) => {
    const scroller = page.locator("[data-slot=science-nav-scroller]");
    const [sw, cw] = await scroller.evaluate((e) => [e.scrollWidth, e.clientWidth]);
    if (info.project.name === "desktop") expect(sw).toBeLessThanOrEqual(cw);
    else expect(sw).toBeGreaterThan(cw);
    expect(await noHScroll(page)).toBe(true);
  });

  for (const id of SECTIONS) {
    test(`link to ${id} lands with the heading fully visible below the bar, and marks it current`, async ({ page }) => {
      const nav = sectionNav(page);
      const link = nav.locator(`a[href="#${id}"]`);
      await link.click();
      await settle(page);
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const heading = page.locator(`#${id}-heading`);
      const navBottom = (await box(nav)).y + (await box(nav)).height;
      const h = await box(heading);
      expect(h.y).toBeGreaterThanOrEqual(navBottom);
      expect(h.y + h.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      // The eyebrow above the heading is visible too.
      expect((await box(page.locator(`#${id} p`).first())).y).toBeGreaterThanOrEqual(navBottom);
      await expect(link).toHaveAttribute("aria-current", "location");
      await expect(nav.locator("[aria-current=location]")).toHaveCount(1);
      // The current item is scrolled into view in the row.
      const l = await box(link);
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.x + l.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    });
  }

  test("a fragment URL loads with its heading visible below the bar", async ({ page }) => {
    await page.goto("/the-science#descending");
    await page.evaluate(() => document.fonts.ready);
    await settle(page);
    const nav = sectionNav(page);
    const navBottom = (await box(nav)).y + (await box(nav)).height;
    const h = await box(page.locator("#descending-heading"));
    expect(h.y).toBeGreaterThanOrEqual(navBottom);
    expect(h.y).toBeLessThan(page.viewportSize()!.height / 2);
    await expect(nav.locator('a[href="#descending"]')).toHaveAttribute("aria-current", "location");
  });

  test("the current item follows ordinary scrolling, and the hero has none", async ({ page }) => {
    const nav = sectionNav(page);
    await expect(nav.locator("[aria-current=location]")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo({ top: document.getElementById("the-mind")!.offsetTop + 200, behavior: "instant" }));
    await settle(page);
    await expect(nav.locator('a[href="#the-mind"]')).toHaveAttribute("aria-current", "location");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await settle(page);
    await expect(nav.locator("[aria-current=location]")).toHaveCount(0);
  });

  test("works from the keyboard, with a visible focus ring", async ({ page }) => {
    const link = sectionNav(page).locator('a[href="#workouts"]');
    await link.focus();
    await expect(link).toBeFocused();
    expect(await link.evaluate((e) => getComputedStyle(e).boxShadow)).toMatch(/0px 0px 0px 3px/);
    await page.keyboard.press("Enter");
    await settle(page);
    await expect(page).toHaveURL(/#workouts$/);
    const navBottom = (await box(sectionNav(page))).y + (await box(sectionNav(page))).height;
    expect((await box(page.locator("#workouts-heading"))).y).toBeGreaterThanOrEqual(navBottom);
  });

  test("citations link to their source entries, which land below the bar", async ({ page }) => {
    const cite = page.locator("#physics [data-slot=cite] a").first();
    await expect(cite).toHaveAccessibleName("Source 1, Minetti et al., 2002");
    await cite.click();
    await settle(page);
    await expect(page).toHaveURL(/#source-minetti-2002$/);
    const navBottom = (await box(sectionNav(page))).y + (await box(sectionNav(page))).height;
    expect((await box(page.locator("#source-minetti-2002"))).y).toBeGreaterThanOrEqual(navBottom - 1);
  });
});

test.describe("hero motion", () => {
  test("animates when motion is allowed, and pauses with the footer control", async ({ page }) => {
    const terrain = page.locator("[data-slot=terrain-lines]");
    await expect(terrain).toHaveAttribute("data-state", "animating");
    await page.getByRole("button", { name: /Pause motion/ }).first().click();
    await expect(terrain).toHaveAttribute("data-state", "still");
  });

  test("draws one still frame under reduced motion, and the section links jump", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/the-science");
    await expect(page.locator("[data-slot=terrain-lines]")).toHaveAttribute("data-state", "still");
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
    await context.close();
  });

  test("the canvas has drawn lines, behind the text", async ({ page }) => {
    // The first frame is drawn after hydration; on a slow runner that can follow page load.
    await expect(page.locator("[data-slot=terrain-lines]")).not.toHaveAttribute("data-state", "pending");
    const lit = () =>
      page.locator("[data-slot=terrain-lines] canvas").evaluate((c: HTMLCanvasElement) => {
        const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
        return n;
      });
    await expect.poll(lit).toBeGreaterThan(1000);
    expect(await page.locator("[data-slot=terrain-lines]").evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
  });
});

test.describe("interactive figures", () => {
  test("incline slider updates the geometry", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "Grade" });
    await slider.scrollIntoViewIfNeeded();
    await expect(page.locator("[data-slot=incline-readout]")).toContainText(/Grade\s*10%/); // the introduction has finished
    await slider.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-slot=incline-readout]")).toContainText("15%");
    await expect(page.locator("[data-slot=incline-readout]")).toContainText("8.5°");
  });

  test("accumulator recalculates and validates", async ({ page }) => {
    const total = page.locator("[data-slot=accumulator-total]");
    await expect(total).toHaveText("1,000 ft");
    await page.getByLabel("Completed repeats").fill("30");
    await expect(total).toHaveText("1,200 ft");
    await page.getByLabel("Completed repeats").fill("0");
    await expect(page.getByText("Enter a whole number from 1 to 200.")).toBeVisible();
    expect(await noHScroll(page)).toBe(true);
  });

  test("breathing guide runs on real time and resets", async ({ page }) => {
    await page.clock.install();
    await page.goto("/the-science");
    const phase = page.locator("[data-slot=breath-phase]");
    await expect(phase).toHaveText("Ready");
    await page.getByRole("button", { name: "Start" }).click();
    await page.clock.runFor(500);
    await expect(phase).toHaveText("Inhale");
    await page.clock.runFor(4000);
    await expect(phase).toHaveText("Hold");
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.clock.runFor(10_000);
    await expect(phase).toHaveText("Hold");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(phase).toHaveText("Ready");
  });
});

test.describe("header with four links", () => {
  test("fits one row at 320px without sideways scroll", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "narrowest phone width");
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/the-science");
    await page.evaluate(() => document.fonts.ready);
    expect(await noHScroll(page)).toBe(true);
    const links = page.getByRole("navigation", { name: "Primary" }).getByRole("link");
    const rects = await links.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, w: r.width, y: r.y })));
    expect(new Set(rects.map((r) => Math.round(r.y))).size).toBe(1);
    expect(rects.at(-1)!.x + rects.at(-1)!.w).toBeLessThanOrEqual(320.5);
  });
});

test.describe("refinement pass: fills, layout, figures", () => {
  test("sections alternate white and black, starting white", async ({ page }) => {
    const fills = await page.locator("main section[data-slot=science-section]").evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
    expect(fills).toEqual(SECTIONS.map((_, i) => (i % 2 === 0 ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)")));
    // Text inverts with the fill.
    expect(await page.locator("#physiology-heading").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(255, 255, 255)");
    expect(await page.locator("#training-heading").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(0, 0, 0)");
  });

  test("eyebrows carry the section name only", async ({ page }) => {
    const eyebrows = await page.locator("[data-slot=science-eyebrow]").allTextContents();
    expect(eyebrows.map((t) => t.trim())).toEqual(LABELS);
  });

  test("every figure sits in a rounded, light tie-dye frame with its diagram dark on light", async ({ page }) => {
    const frames = page.locator("[data-slot=figure-frame]");
    await expect(frames).toHaveCount(7);
    for (const f of await frames.all()) {
      expect(await f.locator(".cmr-tie-dye").count()).toBe(1);
      expect(parseFloat(await f.evaluate((e) => getComputedStyle(e).borderTopLeftRadius))).toBeGreaterThanOrEqual(12);
      expect(parseFloat(await f.evaluate((e) => getComputedStyle(e).paddingTop))).toBeGreaterThanOrEqual(20);
      expect(await f.evaluate((e) => getComputedStyle(e).color)).toBe("rgb(0, 0, 0)");
    }
  });

  test("text and figure sit side by side from 1280px, alternating sides; stacked text-first below", async ({ page }, info) => {
    const sides = { physics: "right", physiology: "left", training: "right", breathing: "left", "the-mind": "right", descending: "left" } as const;
    for (const [id, side] of Object.entries(sides)) {
      const row = page.locator(`#${id} [data-slot=split-row]`).first();
      const text = await box(row.locator("[data-slot=split-text]").first());
      const fig = await box(row.locator("[data-slot=split-figure]"));
      if (info.project.name === "desktop") {
        if (side === "right") expect(fig.x).toBeGreaterThan(text.x + text.width);
        else expect(text.x).toBeGreaterThan(fig.x + fig.width);
        expect(Math.abs(fig.y - text.y)).toBeLessThanOrEqual(8); // tops aligned
        expect(fig.width).toBeGreaterThan(500);
        expect(text.width).toBeGreaterThan(500);
      } else {
        expect(fig.y).toBeGreaterThan(text.y + text.height - 1); // text first
      }
    }
    expect(await noHScroll(page)).toBe(true);
  });

  test("instructions name the figure's real position", async ({ page }, info) => {
    const lines = page.locator("[data-slot=figure-instruction]");
    await expect(lines).toHaveCount(3);
    const texts = (await lines.allInnerTexts()).map((t) => t.replace(/\s+/g, " "));
    if (info.project.name === "desktop") {
      expect(texts[0]).toContain("in the figure to the right to explore the relationship between grade, angle, and elevation gain.");
      expect(texts[1]).toContain("figure to the right");
      expect(texts[2]).toContain("figure to the left");
    } else {
      for (const t of texts) expect(t).toContain("figure below");
    }
    for (const t of texts) expect(t).not.toMatch(/figure below figure|to the (left|right) figure/);
  });

  test("the incline starts flat, rises to 10% once on first view, and stays interactive", async ({ page }) => {
    const readout = page.locator("[data-slot=incline-readout]");
    await expect(readout).toContainText(/Grade\s*0%/);
    await page.locator("[data-slot=incline-diagram]").evaluate((e) => {
      document.documentElement.style.scrollBehavior = "auto";
      e.scrollIntoView({ block: "center" });
    });
    await expect(page.locator("[data-slot=incline-diagram]")).toHaveAttribute("data-animating", "");
    await expect(readout).toContainText(/Grade\s*10%/, { timeout: 4000 });
    await expect(page.locator("[data-slot=incline-diagram]")).not.toHaveAttribute("data-animating");
    // Once only: away and back, the visitor's value stays.
    await page.getByRole("slider", { name: "Grade" }).fill("20");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.locator("[data-slot=incline-diagram]").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(2200);
    await expect(readout).toContainText(/Grade\s*20%/);
  });

  test("touching the slider during the introduction cancels it", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "Grade" });
    await page.locator("[data-slot=incline-diagram]").evaluate((e) => {
      document.documentElement.style.scrollBehavior = "auto";
      e.scrollIntoView({ block: "center" });
    });
    await expect(page.locator("[data-slot=incline-diagram]")).toHaveAttribute("data-animating", "");
    await slider.fill("33");
    await page.waitForTimeout(2200);
    await expect(page.locator("[data-slot=incline-readout]")).toContainText(/Grade\s*33%/);
  });

  test("under reduced motion the incline shows 10% without animating", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/the-science");
    const fig = page.locator("[data-slot=incline-diagram]");
    await fig.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await expect(page.locator("[data-slot=incline-readout]")).toContainText(/Grade\s*10%/, { timeout: 1000 });
    await expect(fig).not.toHaveAttribute("data-animating");
    await context.close();
  });

  test("the runner illustration names the three muscle groups", async ({ page }) => {
    const fig = page.locator("[data-slot=runner-illustration] svg");
    await expect(fig).toHaveAccessibleName(/gluteus maximus.*quadriceps.*calf/i);
    for (const label of ["Gluteus maximus", "Quadriceps", "Calf muscles"]) await expect(fig.getByText(label, { exact: true })).toBeAttached();
  });
});

