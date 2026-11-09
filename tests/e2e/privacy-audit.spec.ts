import { expect, test } from "@playwright/test";

/**
 * Privacy / integration audit evidence (.aiom/work/implement-cmr-join-page.md).
 * Observes what a visitor's browser actually does on the built site: which
 * hosts it contacts, what it stores and which cookies are set. Formspree is
 * mocked for the Join submission; the live form is never contacted.
 *
 * These are observations of the current build, not privacy claims; the Privacy
 * Policy may only say what this audit and the hosting settings support.
 */
const PAGES = ["/", "/join", "/about", "/hills", "/hills/cricket-hill", "/calendar", "/privacy", "/terms", "/participation-guidelines"];

test("no third-party requests, cookies or stored data while browsing", async ({ page, context }) => {
  const origin = new URL(test.info().project.use.baseURL ?? "http://localhost:4319").origin;
  const foreign: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(origin) && !u.startsWith("data:") && !u.startsWith("blob:")) foreign.push(u);
  });
  await page.route("https://formspree.io/**", (r) => r.abort());

  for (const path of PAGES) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
  }
  expect(foreign, "requests to other hosts").toEqual([]);
  expect(await context.cookies(), "cookies").toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe("");
  // Nothing is written until the visitor uses the footer motion control.
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  expect(await page.evaluate(async () => (await indexedDB.databases?.())?.length ?? 0)).toBe(0);
});

test("the only thing stored is the visitor's own motion choice, and only after they make it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Pause|Resume/ }).first().click();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(["cmr-motion"]);
  expect(await page.evaluate(() => ["on", "off"].includes(localStorage.getItem("cmr-motion") ?? ""))).toBe(true);
});

test("no analytics, tag manager, pixel, chat or embed scripts or frames in the served pages", async ({ request }) => {
  for (const path of PAGES) {
    const html = await (await request.get(path)).text();
    expect(html, path).not.toMatch(/google-analytics|googletagmanager|gtag\(|plausible|fathom|segment|hotjar|clarity\.ms|facebook\.net|fbq\(|vercel-scripts|_vercel\/insights|stripe\.com|recaptcha|<iframe/i);
    expect(html, path).not.toMatch(/<script[^>]+src="https?:\/\//i);
  }
});

test("submitting Join contacts only the Join Formspree form and sends only the three fields", async ({ page }) => {
  const posts: { url: string; fields: string[] }[] = [];
  const foreign: string[] = [];
  const origin = new URL(test.info().project.use.baseURL ?? "http://localhost:4319").origin;
  page.on("request", (r) => {
    if (!r.url().startsWith(origin)) foreign.push(`${r.method()} ${r.url()}`);
  });
  await page.route("https://formspree.io/**", async (route) => {
    const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "*" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const body = route.request().postData() ?? "";
    posts.push({ url: route.request().url(), fields: [...body.matchAll(/name="([^"]+)"/g)].map((m) => m[1]) });
    await route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: JSON.stringify({ ok: true, next: "https://formspree.io/thanks" }) });
  });
  await page.goto("/join");
  const form = page.locator("#join");
  await form.getByLabel("First name").fill("Sam");
  await form.getByLabel("Email address").fill("sam@example.com");
  await form.getByRole("checkbox", { name: "I'm 18 or older." }).check();
  await form.getByRole("button", { name: "Join the club" }).click();
  await expect(form.getByRole("status")).toContainText("YOU'RE IN.");
  expect(posts).toHaveLength(1);
  expect(posts[0].url).toBe("https://formspree.io/f/xrppvnln");
  expect(posts[0].fields.sort()).toEqual(["_gotcha", "_subject", "age_18_plus", "email", "first_name"]);
  expect(foreign.filter((f) => !f.includes("formspree.io"))).toEqual([]);
});
