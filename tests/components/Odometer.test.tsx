import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { finalIndex, Odometer } from "@/components/Odometer";

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;
let observers: { cb: IOCallback; disconnect: ReturnType<typeof vi.fn> }[];
let reduceMotion = false;

beforeEach(() => {
  observers = [];
  reduceMotion = false;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      cb: IOCallback;
      disconnect = vi.fn();
      constructor(cb: IOCallback) {
        this.cb = cb;
        observers.push(this);
      }
      observe() {}
    },
  );
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce") && reduceMotion }));
});
afterEach(() => vi.unstubAllGlobals());

const strips = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>("[style*=translateY]")];
const shift = (el: HTMLElement) => Number(/translateY\(-?(\d+)em\)/.exec(el.style.transform)?.[1]);

describe("Odometer", () => {
  it("renders the final value statically, with the value as text for assistive tech", () => {
    const { container } = render(<Odometer value="2.5K" srLabel="2.5K miles" />);
    expect(container.querySelector(".sr-only")).toHaveTextContent("2.5K miles");
    expect(container.querySelector("[aria-hidden]")).toBeInTheDocument();
    // one strip per digit, parked on its final digit
    expect(strips(container).map(shift)).toEqual([finalIndex(2), finalIndex(5)]);
  });

  it("parks at zero off-screen, rolls once on entry, then stops observing", () => {
    const { container } = render(<Odometer value="240" />);
    const io = observers[0];
    act(() => io.cb([{ isIntersecting: false }]));
    expect(container.firstElementChild).toHaveAttribute("data-odometer", "armed");
    expect(strips(container).map(shift)).toEqual([0, 0, 0]);
    act(() => io.cb([{ isIntersecting: true }]));
    expect(container.firstElementChild).toHaveAttribute("data-odometer", "rolling");
    expect(strips(container).map(shift)).toEqual([finalIndex(2), finalIndex(4), finalIndex(0)]);
    expect(strips(container)[0].style.transition).toMatch(/transform \d+ms/);
    expect(io.disconnect).toHaveBeenCalled();
  });

  it("stays still when already visible at load (no flash of zeros)", () => {
    const { container } = render(<Odometer value="132K" />);
    act(() => observers[0].cb([{ isIntersecting: true }]));
    expect(container.firstElementChild).toHaveAttribute("data-odometer", "settled");
    expect(observers[0].disconnect).toHaveBeenCalled();
  });

  it("never animates under prefers-reduced-motion", () => {
    reduceMotion = true;
    const { container } = render(<Odometer value="132K" />);
    expect(observers).toHaveLength(0);
    expect(container.firstElementChild).toHaveAttribute("data-odometer", "settled");
  });
});
