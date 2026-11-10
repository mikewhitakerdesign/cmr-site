import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BreathingPacer } from "@/components/science/BreathingPacer";
import { ElevationAccumulator } from "@/components/science/ElevationAccumulator";
import { InclineDiagram } from "@/components/science/InclineDiagram";
import { axeViolations } from "../../axe";

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.removeAttribute("data-motion");
});

/** A controllable IntersectionObserver: `fire(ratio)` reports the figure's visibility. */
function mockIntersection() {
  let cb: IntersectionObserverCallback = () => {};
  const observer = { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: unknown, c: IntersectionObserverCallback) {
      cb = c;
      return observer;
    }),
  );
  return {
    fire: (ratio: number) =>
      act(() => cb([{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], observer as unknown as IntersectionObserver)),
    observer,
  };
}
const fakeFrames = () => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "Date"] });
const readout = () => document.querySelector("[data-slot=incline-readout]")!;

describe("InclineDiagram introduction", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("starts flat and rises smoothly to 10% once the figure is half in view, then holds", () => {
    fakeFrames();
    const io = mockIntersection();
    render(<InclineDiagram />);
    expect(readout()).toHaveTextContent("0%");
    io.fire(0.2);
    act(() => vi.advanceTimersByTime(500));
    expect(readout()).toHaveTextContent(/^Grade0%/); // not yet meaningfully visible
    io.fire(0.6);
    act(() => vi.advanceTimersByTime(800));
    const mid = Number(readout().textContent!.match(/Grade([\d.]+)%/)![1]);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(10);
    act(() => vi.advanceTimersByTime(1500));
    expect(readout()).toHaveTextContent(/^Grade10%/);
    expect(screen.getByRole("slider", { name: "Grade" })).toHaveValue("10");
    expect(io.observer.disconnect).toHaveBeenCalled(); // plays once
  });

  it("a visitor's slider input cancels the animation and stands", () => {
    fakeFrames();
    const io = mockIntersection();
    render(<InclineDiagram />);
    io.fire(1);
    act(() => vi.advanceTimersByTime(400));
    fireEvent.change(screen.getByRole("slider", { name: "Grade" }), { target: { value: "30" } });
    act(() => vi.advanceTimersByTime(3000));
    expect(readout()).toHaveTextContent(/^Grade30%/);
  });

  it("shows 10% without a transition under reduced motion", () => {
    fakeFrames();
    document.documentElement.setAttribute("data-motion", "off");
    const io = mockIntersection();
    render(<InclineDiagram />);
    io.fire(1);
    expect(readout()).toHaveTextContent(/^Grade10%/);
    expect(document.querySelector("[data-slot=incline-diagram]")).not.toHaveAttribute("data-animating");
  });
});

describe("InclineDiagram", () => {
  it("shows the illustrative 10 percent and recomputes the geometry from the slider", async () => {
    render(<InclineDiagram />);
    const slider = screen.getByRole("slider", { name: "Grade" });
    // jsdom has no IntersectionObserver: the figure shows 10% on the next frame.
    await waitFor(() => expect(slider).toHaveValue("10"));
    expect(slider).toHaveAttribute("aria-valuetext", "10 percent grade: 5.7 degrees, rising 10.0 feet over 100 feet");
    fireEvent.change(slider, { target: { value: "45" } });
    const readout = document.querySelector("[data-slot=incline-readout]")!;
    expect(readout).toHaveTextContent("45%");
    expect(readout).toHaveTextContent("24.2°");
    expect(readout).toHaveTextContent("45.0 ft");
    expect(screen.getByRole("img")).toHaveAccessibleName(/45 percent grade.*rises 45\.0 feet.*24\.2 degrees/);
  });

  it("says it is geometry, not a physiological calculator", () => {
    render(<InclineDiagram />);
    expect(screen.getByText(/Geometry only\./)).toHaveTextContent("do not estimate effort, oxygen use or calories");
    expect(screen.getByRole("slider")).toHaveAccessibleDescription(/Geometry only/);
  });
});

describe("ElevationAccumulator", () => {
  const total = () => document.querySelector("[data-slot=accumulator-total]")!;

  it("shows the default example and recalculates as you type", async () => {
    const user = userEvent.setup();
    render(<ElevationAccumulator />);
    expect(total()).toHaveTextContent("1,000 ft");
    const gain = screen.getByLabelText("Elevation gain per climb (ft)");
    await user.clear(gain);
    await user.type(gain, "60");
    expect(total()).toHaveTextContent("1,500 ft");
    const repeats = screen.getByLabelText("Completed repeats");
    await user.clear(repeats);
    await user.type(repeats, "10");
    expect(total()).toHaveTextContent("600 ft");
    expect(screen.getByText("About 183 m")).toBeInTheDocument();
  });

  it("flags invalid input with a linked error and shows no total", async () => {
    const user = userEvent.setup();
    render(<ElevationAccumulator />);
    const repeats = screen.getByLabelText("Completed repeats");
    await user.clear(repeats);
    await user.type(repeats, "500");
    expect(repeats).toHaveAttribute("aria-invalid", "true");
    expect(repeats).toHaveAccessibleDescription("Enter a whole number from 1 to 200.");
    expect(total()).toHaveTextContent("–");
    await user.clear(repeats);
    await user.type(repeats, "2");
    expect(repeats).not.toHaveAttribute("aria-invalid");
    expect(total()).toHaveTextContent("80 ft");
  });

  it("has no axe violations, valid or invalid", async () => {
    const user = userEvent.setup();
    const { container } = render(<ElevationAccumulator />);
    expect(await axeViolations(container)).toEqual([]);
    await user.clear(screen.getByLabelText("Completed repeats"));
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("BreathingPacer", () => {
  const phase = () => document.querySelector("[data-slot=breath-phase]")!.textContent;
  const fake = () => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance", "setTimeout", "Date"] });

  it("never starts on its own", () => {
    fake();
    render(<BreathingPacer />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(phase()).toBe("Ready");
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });

  it("follows box breathing in real time, and pauses, resumes and resets", () => {
    fake();
    render(<BreathingPacer />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(100));
    expect(phase()).toBe("Inhale");
    act(() => vi.advanceTimersByTime(4000));
    expect(phase()).toBe("Hold");
    act(() => vi.advanceTimersByTime(4000));
    expect(phase()).toBe("Exhale");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(20_000));
    expect(phase()).toBe("Exhale");
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    act(() => vi.advanceTimersByTime(4000));
    expect(phase()).toBe("Hold");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(phase()).toBe("Ready");
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("switches to the extended exhale (4 in, 6 out) and resets when the pattern changes", () => {
    fake();
    render(<BreathingPacer />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.click(screen.getByRole("radio", { name: "Extended exhale" }));
    expect(phase()).toBe("Ready");
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(4100));
    expect(phase()).toBe("Exhale");
    act(() => vi.advanceTimersByTime(5000));
    expect(phase()).toBe("Exhale");
    act(() => vi.advanceTimersByTime(1000));
    expect(phase()).toBe("Inhale");
  });

  it("shows the moving dot only when motion is allowed", () => {
    fake();
    const { unmount } = render(<BreathingPacer />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(500));
    expect(document.querySelector("[data-slot=breath-dot]")).not.toBeNull();
    unmount();

    document.documentElement.setAttribute("data-motion", "off");
    render(<BreathingPacer />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(4100));
    expect(document.querySelector("[data-slot=breath-dot]")).toBeNull();
    expect(phase()).toBe("Hold");
  });

  it("cancels its animation frame on unmount", () => {
    fake();
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<BreathingPacer />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    act(() => vi.advanceTimersByTime(200));
    unmount();
    expect(cancel).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("carries a safety caution and makes no medical promise", () => {
    render(<BreathingPacer />);
    expect(screen.getByText(/stop if you feel lightheaded/)).toHaveTextContent(/in or near water/);
    expect(screen.getByText(/stop if you feel lightheaded/)).toHaveTextContent(/not a treatment for any medical condition/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<BreathingPacer />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
