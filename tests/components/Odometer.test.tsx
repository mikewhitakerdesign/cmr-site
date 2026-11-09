import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { countdownStart, finalIndex, Odometer, rollDuration } from "@/components/Odometer";

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

  it("rolls a little more slowly than Round 2 (1.5 s first digit)", () => {
    expect(rollDuration(0)).toBe(1500);
    const { container } = render(<Odometer value="24" />);
    act(() => observers[0].cb([{ isIntersecting: false }]));
    act(() => observers[0].cb([{ isIntersecting: true }]));
    expect(strips(container)[0].style.transition).toMatch(/transform 1500ms/);
  });

  it("counts down from `from`: changed digits start a turn above and spin down; the rest stay put", () => {
    const { container } = render(<Odometer value="1,022" from="1,154" />);
    act(() => observers[0].cb([{ isIntersecting: false }]));
    expect(strips(container).map(shift)).toEqual([finalIndex(1), countdownStart(1), countdownStart(5), countdownStart(4)]);
    act(() => observers[0].cb([{ isIntersecting: true }]));
    expect(strips(container).map(shift)).toEqual([finalIndex(1), finalIndex(0), finalIndex(2), finalIndex(2)]);
    expect(strips(container)[0].style.transition).toBe("none"); // unchanged digit
    expect(container.querySelector(".sr-only")).toHaveTextContent("1,022");
  });

  it("can start with its section instead of itself", () => {
    const { container } = render(
      <section>
        <Odometer value="9" watch="section" />
      </section>,
    );
    expect(observers).toHaveLength(1);
    act(() => observers[0].cb([{ isIntersecting: false }]));
    expect(container.querySelector("[data-odometer]")).toHaveAttribute("data-odometer", "armed");
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
