import { describe, expect, it } from "vitest";
import { fluidAt, fluidCss, fluidVars } from "@/lib/fluid";

describe("fluid values", () => {
  const hero = [48, 98, 209] as const;

  it("equals the Figma value exactly at each frame width", () => {
    expect(fluidAt(hero, 393)).toBe(48);
    expect(fluidAt(hero, 768)).toBe(98);
    expect(fluidAt(hero, 1400)).toBe(209);
  });

  it("holds the desktop value from the container max up (1440, 1732)", () => {
    expect(fluidAt(hero, 1440)).toBe(209);
    expect(fluidAt(hero, 1732)).toBe(209);
  });

  it("interpolates linearly and monotonically between frames", () => {
    expect(fluidAt(hero, 1084)).toBeCloseTo(98 + (209 - 98) / 2, 6);
    let prev = -Infinity;
    for (let w = 320; w <= 1800; w += 7) {
      const v = fluidAt(hero, w);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it("extrapolates below 393 down to 320, then stops (no runaway shrink)", () => {
    expect(fluidAt(hero, 320)).toBeCloseTo(48 - (50 * 73) / 375, 6);
    expect(fluidAt(hero, 280)).toBe(fluidAt(hero, 320));
  });

  it("handles decreasing values (e.g. a gap that tightens on desktop)", () => {
    const v = [74, 34, 154] as const;
    expect(fluidAt(v, 393)).toBe(74);
    expect(fluidAt(v, 600)).toBeLessThan(74);
    expect(fluidAt(v, 600)).toBeGreaterThan(34);
    expect(fluidAt(v, 768)).toBe(34);
  });

  it("emits CSS clamp() expressions whose slope/intercept reproduce fluidAt", () => {
    const { a, b } = fluidCss(hero);
    const parse = (css: string) => {
      const m = /clamp\((-?[\d.]+)px, calc\((-?[\d.]+)px \+ (-?[\d.]+)vw\), (-?[\d.]+)px\)/.exec(css)!;
      const [lo, c, s, hi] = m.slice(1).map(Number);
      return (w: number) => Math.min(Math.max(c + (s * w) / 100, lo), hi);
    };
    for (const w of [320, 393, 500, 700]) expect(parse(a)(w)).toBeCloseTo(fluidAt(hero, w), 2);
    for (const w of [768, 1024, 1280, 1400, 1732]) expect(parse(b)(w)).toBeCloseTo(fluidAt(hero, w), 2);
  });

  it("emits a constant when two anchors are equal", () => {
    expect(fluidCss([16, 16, 18]).a).toBe("16px");
  });

  it("defines -a and -b custom properties per value", () => {
    expect(Object.keys(fluidVars({ "--x": [1, 2, 3], "--y": [4, 4, 4] }))).toEqual(["--x-a", "--x-b", "--y-a", "--y-b"]);
  });
});
