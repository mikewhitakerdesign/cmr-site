#!/usr/bin/env node
/**
 * Builds the Brand Standards PDF from the site's print route.
 *
 *   source  /brand/print  (src/app/brand/print/page.tsx): cover, contents, every
 *           chapter and the colophon, one fixed-size page each
 *   output  public/downloads/cmr-brand-standards.pdf — a static file the site
 *           links to. Nothing generates PDFs at runtime.
 *
 * The website and the PDF share one set of chapters (src/content/brand) and one
 * set of values (src/lib/brand), so this script only prints; it authors nothing.
 *
 * Usage (a production build must be running, on any port):
 *
 *   npm run build && npm run start -- -p 4320 &
 *   npm run brand:pdf -- --base http://localhost:4320
 *
 *   --base <url>   origin of the running site (default http://localhost:3000)
 *   --out <path>   output file (default public/downloads/cmr-brand-standards.pdf)
 *   --check        validate the pages only; write nothing
 *
 * Validation, before anything is written (any failure exits 1, no file):
 *   - the page count equals the count the route declares (`data-pages`)
 *   - every page is exactly the page size, and no page's content is taller or
 *     wider than its page (nothing is clipped at a page edge)
 *   - nothing spills out of its own container (nothing overlaps what follows it)
 *   - every image has loaded and decoded; web fonts are ready
 *   - folios run 1…N in order
 * After writing: the PDF's own page count is read back and compared.
 *
 * Page: US Letter landscape (11 × 8.5 in). The route lays pages out at
 * 1320 × 1020 CSS px and the PDF is printed at 80%, so the site's desktop
 * layouts apply and 16px body type prints at about 9.6pt (src/styles/brand.css).
 */
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const OUT = arg("out", "public/downloads/cmr-brand-standards.pdf");
const CHECK_ONLY = args.includes("--check");

const PAGE = { w: 1320, h: 1020, scale: 0.8, width: "11in", height: "8.5in" };

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: PAGE.w, height: PAGE.h }, reducedMotion: "reduce", deviceScaleFactor: 2 });
  const page = await context.newPage();
  const res = await page.goto(`${BASE}/brand/print`, { waitUntil: "networkidle" });
  if (!res || res.status() !== 200) throw new Error(`${BASE}/brand/print answered ${res?.status() ?? "nothing"}. Is the site running?`);

  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });

  // Off-screen images are lazy on the web; a PDF needs all of them. (The 2× device scale above makes
  // next/image pick sources about twice the layout size, so photographs print near 200 dpi.)
  const brokenImages = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("img")];
    for (const img of imgs) img.loading = "eager";
    const broken = [];
    await Promise.all(
      imgs.map(async (img) => {
        try {
          if (!img.complete) await new Promise((ok, fail) => ((img.onload = ok), (img.onerror = fail)));
          await img.decode();
          if (!img.naturalWidth) broken.push(img.currentSrc || img.src);
        } catch {
          broken.push(img.currentSrc || img.src);
        }
      }),
    );
    await document.fonts.ready;
    return broken;
  });
  await page.waitForLoadState("networkidle");

  const report = await page.evaluate(({ w, h }) => {
    const root = document.querySelector("[data-slot=brand-print]");
    const pages = [...document.querySelectorAll("[data-slot=brand-page]")];
    const problems = [];
    const declared = Number(root?.getAttribute("data-pages"));
    if (declared !== pages.length) problems.push(`The route declares ${declared} pages but renders ${pages.length}.`);
    pages.forEach((el, i) => {
      const n = i + 1;
      const name = `page ${n} (${el.getAttribute("aria-label")})`;
      const r = el.getBoundingClientRect();
      if (Math.abs(r.width - w) > 0.5 || Math.abs(r.height - h) > 0.5) problems.push(`${name} is ${r.width} × ${r.height}, not ${w} × ${h}.`);
      if (Number(el.getAttribute("data-page")) !== n) problems.push(`${name} carries folio ${el.getAttribute("data-page")}.`);
      const folio = el.querySelector("[data-slot=brand-folio]");
      if (n > 1 && Number(folio?.textContent) !== n) problems.push(`${name} prints folio "${folio?.textContent ?? ""}".`);
      // 1. Nothing inside the page may reach past the page's content box.
      // 2. Nothing may spill out of its own container either: a block that is taller than the
      //    space its parent gave it overlaps whatever comes next, even though it stays on the page.
      const box = el.querySelector("[data-slot=brand-page-content]") ?? el;
      const limit = box.getBoundingClientRect();
      const describe = (node) => `<${node.tagName.toLowerCase()}> "${(node.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40)}"`;
      let worst = 0;
      let culprit = "";
      const spills = [];
      for (const child of box.querySelectorAll("*")) {
        const style = getComputedStyle(child);
        if (style.position === "absolute" || style.position === "fixed" || style.display === "none" || style.visibility === "hidden") continue;
        if (child.closest("[aria-hidden=true], .sr-only, svg")) continue;
        const c = child.getBoundingClientRect();
        if (!c.width || !c.height) continue;
        const over = Math.max(c.bottom - limit.bottom, c.right - limit.right);
        if (over > worst) {
          worst = over;
          culprit = describe(child);
        }
        // Inline boxes follow their line, table internals size themselves, and `display: contents` has no box.
        if (/^(inline|contents|table-|ruby)/.test(style.display) && style.display !== "inline-block" && style.display !== "inline-flex") continue;
        const parent = child.parentElement;
        if (!parent || parent === box.parentElement) continue;
        if (getComputedStyle(parent).display === "contents") continue;
        const p = parent.getBoundingClientRect();
        const spill = Math.max(c.bottom - p.bottom, c.right - p.right, p.top - c.top, p.left - c.left);
        if (spill > 1.5) spills.push([spill, describe(child)]);
      }
      if (worst > 1) problems.push(`${name} overflows the page by ${Math.round(worst)}px at ${culprit}.`);
      if (spills.length) {
        spills.sort((a, b) => b[0] - a[0]);
        problems.push(`${name}: ${spills.length} element(s) spill out of their container, worst ${Math.round(spills[0][0])}px at ${spills[0][1]}.`);
      }
    });
    return { count: pages.length, problems };
  }, PAGE);

  for (const src of brokenImages) report.problems.push(`Image did not load: ${src}`);

  if (report.problems.length) {
    console.error(`Brand Standards PDF: ${report.problems.length} problem(s), nothing written.\n`);
    for (const p of report.problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  } else if (CHECK_ONLY) {
    console.log(`Brand Standards PDF: ${report.count} pages validated (check only, nothing written).`);
  } else {
    mkdirSync(dirname(OUT), { recursive: true });
    await page.pdf({
      path: OUT,
      width: PAGE.width,
      height: PAGE.height,
      scale: PAGE.scale,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
      // Tagged for assistive technology, with the headings as bookmarks.
      tagged: true,
      outline: true,
    });
    const bytes = readFileSync(OUT);
    const counts = [...bytes.toString("latin1").matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
    const written = counts.length ? Math.max(...counts) : undefined;
    if (written !== undefined && written !== report.count) {
      console.error(`Brand Standards PDF: wrote ${written} pages, expected ${report.count}. A page broke across sheets.`);
      process.exitCode = 1;
    } else {
      const mb = (statSync(OUT).size / 1024 / 1024).toFixed(1);
      console.log(`Brand Standards PDF: ${OUT}, ${written ?? report.count} pages${written === undefined ? " (count not readable from the file)" : ""}, ${mb} MB.`);
    }
  }
} finally {
  await browser.close();
}
