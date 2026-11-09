import { defineConfig, devices } from "@playwright/test";

// Dedicated port, never reused: an unrelated local server on a common port
// would otherwise be tested instead of this app (this happened once).
const PORT = Number(process.env.E2E_PORT ?? 4319);

/**
 * Browser checks for the shared UI at the three Figma frame widths
 * (Home / Mobile 393, Tablet 768, Desktop — 1440 here, content max 1400).
 * Requires a production build: `npm run build && npm run test:e2e`.
 *
 * - tests/e2e/*.spec.ts: geometry against Figma measurements, computed token
 *   colors, keyboard focus, and axe (incl. color contrast). Platform-
 *   independent → safe for CI.
 * - Visual snapshots (`toHaveScreenshot`) are tagged @visual and excluded by
 *   default: font rasterization differs between macOS and Linux CI, so their
 *   baselines are per-platform. Run with `npm run test:visual`.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  grepInvert: process.env.PW_VISUAL ? undefined : /@visual/,
  use: {
    baseURL: `http://localhost:${PORT}`,
    // WebGL (the contour backgrounds) on GPU-less CI runners: Chromium's software renderer.
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 393, height: 852 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
  },
});
