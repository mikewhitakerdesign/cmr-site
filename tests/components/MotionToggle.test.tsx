import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionToggle } from "@/components/MotionToggle";
import { MOTION_KEY } from "@/lib/motion";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.setAttribute("data-motion", "on");
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});

describe("MotionToggle", () => {
  it("names the action, flips the site state, announces it and remembers the choice", async () => {
    const user = userEvent.setup();
    const { container } = render(<MotionToggle />);
    const live = () => container.querySelector('[data-slot="motion-announce"]');
    const btn = screen.getByRole("button", { name: "Pause motion" });
    await user.click(btn);
    expect(document.documentElement.dataset.motion).toBe("off");
    expect(screen.getByRole("button", { name: "Resume motion" })).toBeInTheDocument();
    expect(live()).toHaveTextContent("Motion paused.");
    expect(localStorage.getItem(MOTION_KEY)).toBe("off");
    await user.click(screen.getByRole("button", { name: "Resume motion" }));
    expect(document.documentElement.dataset.motion).toBe("on");
    expect(live()).toHaveTextContent("Motion resumed.");
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    render(<MotionToggle />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Pause motion" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(document.documentElement.dataset.motion).toBe("off");
  });

  it("shows 'Resume motion' when the page starts paused", () => {
    document.documentElement.setAttribute("data-motion", "off");
    render(<MotionToggle />);
    expect(screen.getByRole("button", { name: "Resume motion" })).toBeInTheDocument();
  });
});
