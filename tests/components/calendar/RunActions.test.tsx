import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunActions } from "@/components/calendar/RunActions";

const props = { slug: "cricket-mtn-repeats", title: "Cricket Mtn Repeats", nextDate: "2026-11-14", recurring: true, directionsUrl: "https://maps.app.goo.gl/11S9yixBqMH3vxC97" };

afterEach(() => vi.unstubAllGlobals());

describe("RunActions", () => {
  it("offers 'Just this run' and 'Entire recurring series' with a no-sync note", async () => {
    const user = userEvent.setup();
    render(<RunActions {...props} />);
    const trigger = screen.getByRole("button", { name: "Add to calendar" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Just this run" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats/ics?scope=occurrence&date=2026-11-14");
    expect(screen.getByRole("link", { name: "Entire recurring series" })).toHaveAttribute("href", "/calendar/cricket-mtn-repeats/ics?scope=series");
    expect(screen.getByText(/won't automatically sync later changes or cancellations/)).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("hides the series option for a one-off run and the menu when nothing is upcoming", () => {
    const { rerender } = render(<RunActions {...props} recurring={false} />);
    expect(screen.queryByRole("link", { name: "Entire recurring series", hidden: true })).toBeNull();
    rerender(<RunActions {...props} nextDate={null} />);
    expect(screen.queryByRole("button", { name: "Add to calendar" })).toBeNull();
  });

  it("links directions to the provided Google Maps URL, exactly", () => {
    render(<RunActions {...props} />);
    const a = screen.getByRole("link", { name: /Get directions/ });
    expect(a).toHaveAttribute("href", "https://maps.app.goo.gl/11S9yixBqMH3vxC97");
    expect(a).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("copies the URL when native share is not available", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<RunActions {...props} />);
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(window.location.origin));
    expect(await screen.findByText("Link copied.")).toBeInTheDocument();
  });

  it("uses the native share sheet on touch devices that have one", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    render(<RunActions {...props} />);
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: "Cricket Mtn Repeats" }));
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });
});
