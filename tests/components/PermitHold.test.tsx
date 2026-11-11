import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HillsOnPause } from "@/components/calendar/HillsOnPause";
import { HillRuns } from "@/components/hills/HillRuns";
import { JustShowUp } from "@/components/home/JustShowUp";
import { NextRunCard } from "@/components/home/NextRunCard";
import { UpcomingRuns } from "@/components/home/UpcomingRuns";
import { hillsWithPages } from "@/lib/hills";
import { PAUSE_COPY } from "@/lib/permit-hold";
import { getNextOccurrencePerRun, getRunsAtHill, getUpcomingRuns } from "@/lib/runs";
import { axeViolations } from "../axe";

const now = new Date("2026-11-12T18:00:00Z");

const hrefs = (c: HTMLElement) => [...c.querySelectorAll("a")].map((a) => a.getAttribute("href"));

describe("Hills on pause (second section of /calendar while held)", () => {
  it("shows the exact heading and body, with the questions phrase as the only control", () => {
    const { container } = render(<HillsOnPause />);
    expect(screen.getByRole("heading", { level: 2, name: "Hills on pause." })).toBeInTheDocument();
    expect(container.querySelector("p")?.textContent).toBe(
      "Weekly hill repeat sessions will be posted shortly. Check back later or send us your questions.",
    );
    const trigger = screen.getByRole("button", { name: "send us your questions" });
    expect(trigger.closest("p")).not.toBeNull(); // inline in the sentence
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("is centred, on the same black surface and container as the section it replaces", () => {
    render(<HillsOnPause />);
    const section = document.querySelector("[data-slot=hills-on-pause]")!;
    expect(section.className).toMatch(/text-center/);
    expect(section.className).toMatch(/bg-primary/);
    expect(section).toHaveAttribute("aria-labelledby", "pause-heading");
  });

  it("is static, schedule-free, names no agency and has no axe violations", async () => {
    const { container } = render(<HillsOnPause />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.querySelector("time, img")).toBeNull();
    expect(container.textContent).not.toMatch(/park district|cpd|permit|insur|waiver|liab/i);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("held variants show no run, date or run-detail link", () => {
  it("homepage Upcoming runs", async () => {
    const { container } = render(<UpcomingRuns held occurrences={getNextOccurrencePerRun(now)} now={now} />);
    expect(screen.getByRole("heading", { level: 2, name: "Hills on pause." })).toBeInTheDocument();
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
    expect(screen.getByText(PAUSE_COPY.bodyShort)).toBeInTheDocument();
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
    render(<JustShowUp />);
    expect(screen.queryByText(/find a run, show up/i)).toBeNull();
    expect(screen.getByText(/Find a hill, show up/)).toBeInTheDocument();
  });
});
