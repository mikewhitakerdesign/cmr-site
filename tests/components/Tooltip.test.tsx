import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "@/components/Header";
import { CommunityCta } from "@/components/calendar/CommunityCta";
import { Tooltip } from "@/components/Tooltip";
import { JOIN_TOOLTIP } from "@/lib/navigation";
import { axeViolations } from "../axe";

describe("Tooltip", () => {
  it("is exact, supplementary and described to assistive technology without changing the link's name", async () => {
    expect(JOIN_TOOLTIP).toBe("No fees. No commitments. Lots of elevation.");
    const { container } = render(
      <Tooltip text={JOIN_TOOLTIP}>
        <a href="/join">Join the club</a>
      </Tooltip>,
    );
    const link = screen.getByRole("link", { name: "Join the club" });
    const tip = container.querySelector("[role=tooltip]")!;
    expect(tip).toHaveTextContent(JOIN_TOOLTIP);
    expect(link.getAttribute("aria-describedby")).toBe(tip.id);
    expect(link).toHaveAccessibleDescription(JOIN_TOOLTIP);
    expect(tip).toHaveClass("pointer-events-none"); // never intercepts a click
    expect(tip.className).toMatch(/group-hover\/tip:opacity-100/); // mouse hover
    expect(tip.className).toMatch(/group-has-focus-visible\/tip:opacity-100/); // keyboard focus
    expect(tip.className).toMatch(/max-sm:hidden/); // not on touch-width screens
    expect(tip.contains(link)).toBe(false);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("is on the header and community Join CTAs, with the same text", () => {
    for (const ui of [<Header key="h" />, <CommunityCta key="c" />]) {
      const { unmount } = render(ui);
      const link = screen.getByRole("link", { name: "Join the club" });
      expect(link).toHaveAccessibleDescription(JOIN_TOOLTIP);
      expect(link).toHaveAttribute("href", "/join");
      unmount();
    }
  });
});
