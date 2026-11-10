import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOTION_EVENT, MOTION_INIT_SCRIPT, MOTION_KEY, chooseMotion, currentMotion, motionOff } from "@/lib/motion";

const stubReduce = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce") ? matches : false, addEventListener() {}, removeEventListener() {} }));
const runInit = () => new Function(MOTION_INIT_SCRIPT)();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-motion");
});
afterEach(() => vi.unstubAllGlobals());

describe("motion preference", () => {
  it("defaults to on, and to off when the system asks for reduced motion", () => {
    stubReduce(false);
    runInit();
    expect(document.documentElement.dataset.motion).toBe("on");
    stubReduce(true);
    runInit();
    expect(document.documentElement.dataset.motion).toBe("off");
    expect(motionOff()).toBe(true);
  });

  it("lets an explicit stored choice win over the system setting, both ways", () => {
    stubReduce(true);
    localStorage.setItem(MOTION_KEY, "on");
    runInit();
    expect(document.documentElement.dataset.motion).toBe("on");
    stubReduce(false);
    localStorage.setItem(MOTION_KEY, "off");
    runInit();
    expect(document.documentElement.dataset.motion).toBe("off");
  });

  it("ignores junk in storage and survives storage that throws", () => {
    stubReduce(false);
    localStorage.setItem(MOTION_KEY, "maybe");
    runInit();
    expect(document.documentElement.dataset.motion).toBe("on");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    runInit();
    expect(document.documentElement.dataset.motion).toBe("on");
    vi.restoreAllMocks();
  });

  it("chooseMotion applies, remembers and announces the change", () => {
    stubReduce(false);
    const seen = vi.fn();
    window.addEventListener(MOTION_EVENT, seen);
    chooseMotion("off");
    expect(currentMotion()).toBe("off");
    expect(localStorage.getItem(MOTION_KEY)).toBe("off");
    expect(seen).toHaveBeenCalledTimes(1);
    window.removeEventListener(MOTION_EVENT, seen);
  });
});
