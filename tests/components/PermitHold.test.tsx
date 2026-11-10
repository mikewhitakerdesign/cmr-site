import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PermitHold } from "@/components/calendar/PermitHold";
import { HillRuns } from "@/components/hills/HillRuns";
import { JustShowUp } from "@/components/home/JustShowUp";
import { NextRunCard } from "@/components/home/NextRunCard";
import { UpcomingRuns } from "@/components/home/UpcomingRuns";
import { hillsWithPages } from "@/lib/hills";
import { PERMIT_HOLD_COPY } from "@/lib/permit-hold";
import { getNextOccurrencePerRun, getRunsAtHill, getUpcomingRuns } from "@/lib/runs";
import { axeViolations } from "../axe";

const now = new Date("2026-11-12T18:00:00Z");

const hrefs = (c: HTMLElement) => [...c.querySelectorAll("a")].map((a) => a.getAttribute("href"));

describe("permit-hold notice", () => {
  it("shows the approved heading, body and supporting copy with two routes forward", () => {
    render(<PermitHold />);
    expect(screen.getByRole("heading", { level: 1, name: PERMIT_HOLD_COPY.heading })).toBeInTheDocument();
    expect(screen.getByText(PERMIT_HOLD_COPY.body)).toBeInTheDocument();
    expect(screen.getByText(PERMIT_HOLD_COPY.supporting)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore the hills" })).toHaveAttribute("href", "/hills");
    expect(screen.getByRole("link", { name: "Join the club" })).toHaveAttribute("href", "/join");
  });

  it("is a static region, not an alert, and has no axe violations", async () => {
    const { container } = render(<PermitHold />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("sits over a dead, schedule-free backdrop with no dismiss control", () => {
    const { container } = render(<PermitHold />);
    const backdrop = container.querySelector("[data-slot=permit-hold-backdrop]")!;
    expect(backdrop).toHaveAttribute("inert");
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop.querySelector("a, button, input, time")).toBeNull();
    expect(backdrop.textContent).toContain("Pick a hill");
    expect(backdrop.textContent).not.toMatch(/weekly|forecast|\d:\d\d/i);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("[data-slot=contour-field]")).toBeNull();
  });

  it("does not use an agency logo or name", () => {
    const { container } = render(<PermitHold />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toMatch(/park district|cpd/i);
  });
});

describe("held variants show no run, date or run-detail link", () => {
  it("homepage Upcoming runs", async () => {
    const { container } = render(<UpcomingRuns held occurrences={getNextOccurrencePerRun(now)} now={now} />);
    expect(screen.getByRole("heading", { level: 2, name: PERMIT_HOLD_COPY.sectionHeading })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Cricket Mtn|Horner Hell|\d:\d\d\s?(AM|PM)/i);
    expect(container.querySelector("time")).toBeNull();
    expect(hrefs(container).every((h) => !h?.startsWith("/calendar"))).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("homepage next-run card", async () => {
    const [next] = getUpcomingRuns(now, 1);
    const { container } = render(<NextRunCard held next={next} now={now} />);
    expect(container.textContent).not.toMatch(/Cricket Mtn|Horner Hell/);
    expect(container.querySelector("time")).toBeNull();
    expect(hrefs(container).every((h) => !h?.startsWith("/calendar"))).toBe(true);
    expect(screen.getByText(PERMIT_HOLD_COPY.short)).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it("hill page Run it with us, for a hill that has a run", async () => {
    const hill = hillsWithPages().find((h) => h.slug === "cricket-hill")!;
    const { container } = render(<HillRuns held hill={hill} runs={getRunsAtHill("cricket-hill", now)} />);
    expect(container.textContent).not.toMatch(/Cricket Mtn|Saturdays|5:30/);
    expect(within(container).queryByRole("link", { name: /View run/ })).toBeNull();
    expect(hrefs(container).every((h) => !h?.startsWith("/calendar"))).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
  });

  it("Just show up no longer suggests organized runs exist", () => {
    render(<JustShowUp held />);
    expect(screen.queryByText(/find a run, show up/i)).toBeNull();
    expect(screen.getByText(/Find a hill, show up/)).toBeInTheDocument();
  });
});
